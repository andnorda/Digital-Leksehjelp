import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';

import './home.html';
import './home.less';

import '../../components/formMessage/formMessage.js';
import '../../components/newSubjectSelector/subjectSelector.js';
import '../../components/button/button.js';

Template.hero.onCreated(function() {
    this.autorun(() => {
        this.subscribe('config.infoMessage');
    });
});

Template.hero.helpers({
    infoMessage() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        return infoMessage && infoMessage.text;
    }
});

Template.homework.helpers({
    infoMessage() {
        return 'For å være sikrere på at det ikke skal skje tekniske feil, bruk nettlesere som Google Chrome, Firefox eller Opera.';
    }
});
