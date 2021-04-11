import { HTTP } from 'meteor/http';
import { Shifts } from '/imports/api/shifts/shifts.js';
import { addWeeks, format } from 'date-fns';
import { stringify } from '/imports/lib/query-string';

const token = process.env.RODEKORS_TOKEN;
const shiftsURL =
    'https://frivillig.rodekors.no/api/digitalleksehjelp/oslorodekors/shifts';

const upsertShifts = shifts => {
    shifts
        .reduce((prev, shift) => {
            const match = prev.find(
                ({ start, end }) => shift.start === start && shift.end === end
            );
            if (match) {
                match.volunteers = [...match.volunteers, ...shift.volunteers];
                return prev;
            }
            return [...prev, shift];
        }, [])
        .forEach(shift =>
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
                                return user ? user.subjects : [];
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

const fetch = () =>
    new Promise((resolve, reject) =>
        HTTP.get(
            `${shiftsURL}?${stringify({
                start: format(new Date(), 'YYYY-MM-DD'),
                end: format(addWeeks(new Date(), 4), 'YYYY-MM-DD')
            })}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
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

const onFetchSuccess = ({ data }) => upsertShifts(data);

const fetchShifts = () => {
    fetch()
        .then(onFetchSuccess)
        .catch(e => {
            console.warn('Error when fetching shifts.', e);
        });
};

export default fetchShifts;
