import { HTTP } from 'meteor/http';
import { Shifts } from '/imports/api/shifts/shifts.js';
import { addWeeks, format } from 'date-fns';
import { stringify } from 'query-string';

const token = process.env.RODEKORS_TOKEN;
const shiftsURL =
    'https://frivillig.rodekors.no/api/digitalleksehjelp/oslorodekors/shifts';

const upsertShifts = shifts => {
    shifts.forEach(shift =>
        Shifts.upsert(
            {
                start: new Date(shift.start),
                end: new Date(shift.end)
            },
            {
                $set: {
                    subjects: shift.volunteers
                        .map(email => {
                            const user = Meteor.users.findOne({
                                username: email
                            });
                            return user
                                ? user.profile.subjects.map(
                                      subject => subject.subjectName
                                  )
                                : [];
                        })
                        .reduce(
                            (subjects, userSubjects) =>
                                subjects.concat(userSubjects),
                            []
                        )
                        .filter(
                            (value, index, array) =>
                                array.indexOf(value) === index
                        )
                }
            }
        )
    );
};

const fetch = ({ page = 1 }) =>
    new Promise((resolve, reject) =>
        HTTP.get(
            `${shiftsURL}?${stringify({
                start: format(new Date(), 'YYYY-MM-DD'),
                end: format(addWeeks(new Date(), 4), 'YYYY-MM-DD'),
                page
            })}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.frivillig.rodekors.v1+json'
                }
            },
            (error, result) => {
                if (error || result.statusCode !== 200) {
                    reject(error);
                } else {
                    resolve(result.data);
                }
            }
        )
    );

const onFetchSuccess = ({ data, meta }) => {
    upsertShifts(data);
    if (meta.current_page < meta.last_page) {
        fetchShifts(meta.current_page + 1);
    }
};

const fetchShifts = (page = 1) => {
    fetch({ page })
        .then(onFetchSuccess)
        .catch(e => {
            console.warn('Error when fetching shifts.', e);
        });
};

export default fetchShifts;
