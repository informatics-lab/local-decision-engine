const utteranceFile = 'utterances/utterance-files/utterances.txt';
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

	data = fs.readFileSync(utteranceFile, 'utf8');
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
	data = fs.readFileSync(utteranceFile, 'utf8');
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
				slotsobj[slots[j]] = match[j+1];
			}
			match_template['slots'] = slotsobj;
			return match_template;
		}
	}
	return null;
}

function compile_template(line) {
	var intent = line.split(' ').slice(0,1)[0];
	var template = line.split(' ').slice(1).join(' ');
	return {'intent': intent, 'template': template};
}

console.log('"'+"what time shall i go for a run?"+'"');
console.log(parse_intent("what time shall i go for a run?"));
console.log('"'+"should i take an umbrella in torquay?"+'"');
console.log(parse_intent("should i take an umbrella in torquay?"));
console.log('"'+"when should i go for a walk on sunday?"+'"');
console.log(parse_intent("when should i go for a walk on sunday?"));