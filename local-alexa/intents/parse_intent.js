const utteranceFileRelative = './utterances/utterance-files/utterances.txt';
const utteranceFile = require.resolve(utteranceFileRelative);
const sampleRequest = require.resolve('./sample_request.json');
const fs = require('fs');
const natural = require('natural');

const punctuation = ["\'", ",", "?"]

function escape_punctuation(u) {
  for (var i=0; i<punctuation.length; i++) {
    u = u.replace(punctuation[i], '\\'+punctuation[i]);
  }
  return u;
}

function guess_intent(utterance) {
	var classifier = new natural.LogisticRegressionClassifier();
	var i = null;

	var data = fs.readFileSync(utteranceFile, 'utf8');
	data = data.split("\n");
	for (var i=0; i<data.length; i++) {
		var match_template = compile_template(data[i]);
		classifier.addDocument(match_template.template, match_template.template);
	}
	classifier.train();
	console.log(classifier);
	return classifier.getClassifications(utterance);
}

function parse_intent(utterance) {
	var data = fs.readFileSync(utteranceFile, 'utf8');
	data = data.split("\n");
	for (var i=0; i<data.length; i++) {
		var match_template = compile_template(data[i]);
		var template = match_template.template;
		template = escape_punctuation(template);
		var slot = new RegExp('{\\w*}');
		var slots = [];
		var thisslot = template.match(slot);
		while (thisslot) {
			thisslot = thisslot[0];
			var newslot = thisslot.substring(1,thisslot.length-1);
			slots.push(newslot);
			var matchslot = '(.*)'
			var template = template.replace(thisslot, matchslot);
			thisslot = template.match(slot);
		}
		var match = utterance.match(new RegExp(template));
		if (match && (match[0] !== '')) {
			var slotsobj = {};
			for (var j=0; j<slots.length; j++) {
				slotsobj[slots[j]] = {name: slots[j], value: match[j+1]};
			}
			match_template['slots'] = slotsobj;
			return match_template;
		}
	}
	return null;
}

function write_session_request(rq) {
	var sessionRequest = JSON.parse(fs.readFileSync(sampleRequest, 'utf8'));
	sessionRequest.request.timestamp = new Date().toISOString();
	sessionRequest.request.intent['name'] = rq.intent;
	sessionRequest.request.intent.slots = rq.slots;
	return sessionRequest;
}

function get_full_request(utterance) {
	return write_session_request(parse_intent(utterance));
}

function compile_template(line) {
	var intent = line.split(' ').slice(0,1)[0];
	var template = line.split(' ').slice(1).join(' ');
	return {'intent': intent, 'template': template};
}

exports.parse_intent = parse_intent;
exports.get_full_request = get_full_request;