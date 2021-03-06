/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const chai = require('chai');
const assert = chai.assert;
const luMerger = require('./../../../src/parser/lu/luMerger');
const luObj = require('../../../src/parser/lu/lu');
const luOptions = require('../../../src/parser/lu/luOptions');
const luisBuilder = require('./../../../src/parser/luis/luisBuilder');
describe('Deep reference tests', function() {
    it('Ability to pull in all answers from a qna', function(done) {
        let luContent = `
> pull in all answers from .qna file. Note: The trailing '?' is required.
> - [all.qna](./all.qna#*answers*?)
# intent1
- [all answers](qna1#*answers*?)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 2);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "answer1");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[1].text, "answer2");
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull all variations from a specific question in .qna', function(done) {
        let luContent = `
> pull in all variations from a specific question. Note: The trailing '?' is required.
> [all.qna](qna2#?-book-flight?)
# intent1
- [all.qna](qna2#?-book-flight?)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 4);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "book flight");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[3].text, "I'm looking to fly");
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull all alterations from qna content', function(done) {
        let luContent = `
> pull in all variations from a specific question. Note: The trailing '?' is required.
> [all.qna](qna3.qna#*alterations*?)
# intent1
- [all.qna](qna3#*alterations*?)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 3);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "botframework");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[2].text, "Microsoft bot framework");
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull in specific named alterations from qna content', function(done) {
        let luContent = `
> pull in speicific named alteration from qna content. Note: Alterations must be $ListName notation. The trailing '?' is required. 
> - [all.qna](./all.qna#$myListName1?)
# intent1
- [all.qna](qna4#$myListName1?)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 2);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "myListName1");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[1].text, "test list");
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull in all utterances and patterns from given lu content', function(done) {
        let luContent = `
# intent1
- [all.lu](lu1#*utterancesandpatterns*)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 4);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "one");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[2].text, "three");
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns.length, 1);
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns[0].pattern, "pattern {one}");
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull in all utterances only', function(done) {
        let luContent = `
# intent1
- [all.lu](lu1#*utterances*)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 4);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "one");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[2].text, "three");
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns.length, 0);
                done()
            })
            .catch(err => done(err))
    })

    it('Ability to pull in all patterns only', function(done) {
        let luContent = `
# intent1
- [all.lu](lu1#*patterns*)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 0);
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns.length, 1);
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns[0].pattern, "pattern {one}");
                assert.equal(res.LUISContent[0].LUISJsonStructure.patterns[0].intent, "intent1");

                done()
            })
            .catch(err => done(err))
    })

    it('Recursively resolve references', function(done) {
        let luContent = `
# intent1
- [lu10](lu10#*)
- [ref2](ref1#*)
- [qna1](qna1#?)
        `;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => {
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances.length, 3);
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[0].text, "result");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[1].text, "q1");
                assert.equal(res.LUISContent[0].LUISJsonStructure.utterances[2].text, "q2");
                done()
            })
            .catch(err => done(err))
    })

    it('failure to find ref throws', function(done) {
        let luContent = `
# foo
- [tom](tom#*)`;
        luMerger.Build([new luObj(luContent)], false, undefined, findLuFiles)
            .then(res => done(res))
            .catch(err => {
                assert.isTrue(err.text.includes('Cannot find reference'))
                done()
            })
    })

    it('Circular references throws', function(done) {
        let luContent = `
# intent1
- [refl1](refl1#*)`
        luMerger.Build([new luObj(luContent, new luOptions('tloop', true))], false, undefined, findLuFiles)
            .then(res => done(res))
            .catch(err => {
                assert.isTrue(err.text.includes('Loop detected'))
                done()
            })
    })

    it('Phrase lists defined as feautre to an entity are handled correctly when the phrase list definition is imported', function(done) {
      let luContent = `
[import phraselist](phraselists)

# test
- utterance

@ ml test1 usesFeature phraseList1
      `;
      luisBuilder.fromLUAsync([new luObj(luContent, new luOptions('main.lu', true))], findLuFiles)
        .then(res => {
          assert.equal(res.entities[0].features[0].featureName, "phraseList1");
          done()
        })
        .catch(err => done(err))
    })

    it('Fix for BF-CLI #797 - deep references to phrase lists are handled correctly', function(done) {
        let luContent = `
@ phraselist pl_1(interchangeable) =
    - pl 1
    - pl 1 1
    
## l_Test
- [l_Test](./Test.lu#Test.Weather)
`;

        luMerger.Build([new luObj(luContent, new luOptions('main.lu', true))], false, undefined, findLuFiles)
        .then(res => done())
        .catch(err => done(err))
    })

    it('NDepth entities with incompatible types throw', function(done) {
        let luContent = `
@ ml AddToName r1 =
    - @ personName personName usesFeature f1
    - @ ml l2 = 
        - @ personName p1

@ ml f1
@ prebuilt personName

[import](./3nDepth.lu)`;
        luisBuilder.fromLUAsync([new luObj(luContent, new luOptions('main.lu', true))], findLuFiles)
            .then(res => done(res))
            .catch(err => done())
    })

    it('NDepth entities are correctly merged via reference', function(done) {
        let luContent = `
@ ml AddToName r1 =
    - @ personName personName usesFeature f1
    - @ ml l2 = 
        - @ personName p1

@ ml f1
@ prebuilt personName

[import](./2nDepth.lu)`;
        luisBuilder.fromLUAsync([new luObj(luContent, new luOptions('main.lu', true))], findLuFiles)
        .then(res => {
            let entitiesJson = `{"entities": [
                {
                  "name": "AddToName",
                  "roles": [
                    "r1",
                    "r2"
                  ],
                  "children": [
                    {
                      "name": "personName",
                      "children": [],
                      "features": [
                        {
                          "modelName": "f1",
                          "isRequired": false
                        },
                        {
                          "modelName": "personName",
                          "isRequired": true
                        },
                        {
                          "modelName": "f2",
                          "isRequired": false
                        }
                      ]
                    },
                    {
                      "name": "l2",
                      "children": [
                        {
                          "name": "p1",
                          "children": [],
                          "features": [
                            {
                              "modelName": "personName",
                              "isRequired": true
                            }
                          ]
                        },
                        {
                          "name": "f2l2",
                          "children": [],
                          "features": [
                            {
                              "modelName": "f2",
                              "isRequired": true
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "NameEntity",
                      "children": [],
                      "features": [
                        {
                          "modelName": "NameEntity",
                          "isRequired": true
                        }
                      ]
                    },
                    {
                      "name": "l3",
                      "children": [
                        {
                          "name": "N2",
                          "children": [],
                          "features": [
                            {
                              "modelName": "NameEntity",
                              "isRequired": true
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "name": "f1",
                  "roles": []
                },
                {
                  "name": "f2",
                  "roles": []
                },
                {
                  "name": "NameEntity",
                  "roles": []
                }
              ]}`;

            let entityParsed = JSON.parse(entitiesJson);
            assert.deepEqual(res.entities, entityParsed.entities);
            assert.equal(res.prebuiltEntities[0].name, 'personName');
            done()
        })
        .catch(err => done(err))
    })
})
    
const findLuFiles = async function(srcId, idsToFind){
    let retPayload = [];
    idsToFind.forEach(ask => {
        switch(ask.filePath) {
            case 'phraselists':
              retPayload.push(new luObj(`
@ phraselist phraseList1 = 
- one
- two
- three
              `, new luOptions(ask.filePath)));
              break;
            case './3nDepth.lu':
                retPayload.push(new luObj(`
@ ml AddToName r2 =
- @ f3 personName usesFeature f2

@ ml f2
@ ml f3`, new luOptions(ask.filePath)));
            case './2nDepth.lu':
                retPayload.push(new luObj(`
@ ml AddToName r2 =
- @ personName personName usesFeature f2
- @ NameEntity NameEntity
- @ ml l3
    - @ NameEntity N2
- @ ml l2
    - @ f2 f2l2
            
@ prebuilt personName
@ ml f2
@ ml NameEntity`, new luOptions(ask.filePath)));
                break;
            case './Test.lu': 
                retPayload.push(new luObj(`
[Phrase list definitions](./phrases.lumodule)

> # Intent definitions
## Test.Weather
- what is the weather`, new luOptions(ask.filePath, false)));
                retPayload.push(new luObj(`
@ phraselist pl_2(interchangeable) =
- pl 2
- pl 2 2`, new luOptions(`phrases.lumodule`, true)))
                break;
            case 'qna1': 
                retPayload.push(new luObj(`
# ? q1
\`\`\`
answer1
\`\`\`

# ? q2
\`\`\`
answer2
\`\`\`
`, new luOptions(ask.filePath, false)));
                break;
            case 'qna2':
                retPayload.push(new luObj(`
# ? book flight
- please book a flight
- I need a flight
- I'm looking to fly
\`\`\`
Sure, happpy to help
\`\`\`
`, new luOptions(ask.filePath, false)));
                break;
            case 'qna3':
                retPayload.push(new luObj(`
# ? book flight
- please book a flight
- I need a flight
- I'm looking to fly
\`\`\`
Sure, happpy to help
\`\`\`

$botframework : qna-alterations=
- bot framework
- Microsoft bot framework
`, new luOptions(ask.filePath, false)));
                break;

            case 'qna4':
                retPayload.push(new luObj(`
# ? book flight
- please book a flight
- I need a flight
- I'm looking to fly
\`\`\`
Sure, happpy to help
\`\`\`

$botframework : qna-alterations=
- bot framework
- Microsoft bot framework

$myListName1 : qna-alterations=
- test list
`, new luOptions(ask.filePath, false)));
                break;

            case 'lu1':
                retPayload.push(new luObj(`
# i1
- one
- two

# i2
- three

# i4
- four
- pattern {one}
`, new luOptions(ask.filePath, false)));
                break;
            case 'refl1':
                retPayload.push(new luObj(`
# test
- one

# test2
- [refl2](refl2#*)
`, new luOptions(ask.filePath, false)));
                retPayload.push(new luObj(`
# all
- two
- [tloop](tloop#*)
`, new luOptions(`refl2`, false)));
            case 'lu10': 
                retPayload.push(new luObj(`
# intent-ref1
- [ref1](ref1#*)
`, new luOptions(ask.filePath, false)));
                retPayload.push(new luObj(`
# final
- result
`, new luOptions('ref1', false)))
                retPayload.push(new luObj(`
# ? q1
\`\`\`
answer1
\`\`\`

# ? q2
\`\`\`
answer2
\`\`\`
`, new luOptions(ask.filePath, false)));
        }
    })
    return retPayload;
}