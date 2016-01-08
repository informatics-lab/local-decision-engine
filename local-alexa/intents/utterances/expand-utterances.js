const intentUtteranceExpand = require('intent-utterance-expand');
const fs = require('fs');
const path = require('path');
const replaceExt = require('replace-ext');
const concat = require('concat-files');

const utteranceKernelRoot = 'utterance-kernel';
const utteranceRoot = 'utterance-files';

const punctuation = ["\'", ",", "?"]

fs.readFile('intents.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var intents = JSON.parse(data);
  var utteranceFileList = [];

  Object.keys(intents).forEach(function(key) {
    var file = intents[key];
    var utteranceFile = path.join(utteranceRoot, replaceExt(file, '.txt'));
    utteranceFileList.push(utteranceFile);
    expandUtteranceFile(file, key, utteranceFile, function(){combineUtteranceFiles(utteranceFileList);});
  });

  console.log(utteranceFileList);
  combineUtteranceFiles(utteranceFileList);

});

function cleanUtterance(u) {
  for (var i=0; i<punctuation.length; i++) {
    u = u.replace(' '+punctuation[i], punctuation[i]);
  }
  return u;
}

function expandUtteranceFile(filename, intentName, utteranceFile, callback) {
  fs.readFile(path.join(utteranceKernelRoot, filename), 'utf8', function (e,data){
    var stream = fs.createWriteStream(utteranceFile);
    var templates = JSON.parse(data).utterances;

    stream.once('open', function(fd) {
      for (var i=0; i<templates.length; i++) {
        var utterances = intentUtteranceExpand(templates[i]).map(cleanUtterance);
        for (var j=0; j<utterances.length; j++){
          stream.write(intentName);
          stream.write(" ");
          stream.write(utterances[j]);
          stream.write("\n");
        }
      }
      stream.end();
      callback();
    });
  })
}

function combineUtteranceFiles(filelist) {
  concat(filelist, path.join(utteranceRoot, 'utterances.txt'), function() {console.log('Written file.')});
}