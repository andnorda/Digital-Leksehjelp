import { Template } from 'meteor/templating';
import { format } from 'date-fns';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Config } from '/imports/api/config/config.js';
import { Shifts } from '/imports/api/shifts/shifts.js';

import '../select/select.js';

import './subjectSelector.html';

const hackedDate = () =>
    new Date(format(new Date(), 'YYYY-MM-DD HH:mm:ss+0000'));

const isAvailable = name => {
    const serviceStatus = Config.findOne({ name: 'serviceStatus' });
    if (serviceStatus && !serviceStatus.open) return true;
    return (
        Shifts.find({
            start: { $lt: hackedDate() },
            end: { $gt: hackedDate() }
        }).count() === 0 ||
        Shifts.find({
            start: { $lt: hackedDate() },
            end: { $gt: hackedDate() },
            subjects: {
                $elemMatch: {
                    $eq: name
                }
            }
        }).count() > 0
    );
};

Template.subjectSelector.onCreated(function () {
    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe('config.serviceStatus');
        this.subscribe(
            'shifts.current',
            format(new Date(), 'YYYY-MM-DD HH:mm:ss+0000')
        );
    });
});

Template.subjectSelector.helpers({
    subjects() {
        if (this.includeAll) {
            return ['Alle fag'].concat(Subjects.find().map(({ name }) => name));
        }
        return Subjects.find().map(({ name }) => name);
    },
    onChange() {
        return this.onChange;
    },
    validationError() {
        return this.validationError;
    },
    sort() {
        return (a, b) => {
            if (a === 'Alle fag') return -1;
            if (b === 'Alle fag') return 1;
            const aAvailable = isAvailable(a);
            const bAvailable = isAvailable(b);
            if (bAvailable && !aAvailable) {
                return 1;
            } else if (!bAvailable && aAvailable) {
                return -1;
            } else {
                const subjectA = Subjects.findOne({ name: a });
                const subjectB = Subjects.findOne({ name: b });
                return (
                    (subjectB ? subjectB.videoChatCount || 0 : 0) -
                    (subjectA ? subjectA.videoChatCount || 0 : 0)
                );
            }
        };
    },
    isAvailable() {
        if (this.allAvailable) {
            return () => true;
        }
        return isAvailable;
    }
});
