/* eslint-disable @typescript-eslint/typedef */
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {LabelResolver} from './labelresolver';
import {OrchestratorHelper} from './orchestratorhelper';

export class OrchestratorTest {
  public static async runAsync(nlrPath: string, inputPath: string, testPath: string, outputPath: string) {

    if (!inputPath || inputPath.length === 0) {
      throw new Error('Please provide path to input file/folder');
    }

    if (!testPath || testPath.length === 0) {
      throw new Error('Please provide test path');
    }

    nlrPath = path.resolve(nlrPath);

    var labelResolver: any = await LabelResolver.createWithSnapshotAsync(nlrPath, path.join(inputPath, 'orchestrator.blu'));
    Utility.debuggingLog(`OrchestratorTest.runAsync(), after calling LabelResolver.createWithSnapshotAsync()`);
  
  
    const utterancesLabelsMap: { [id: string]: string[]; } = {};
    const utterancesDuplicateLabelsMap: Map<string, Set<string>> = new Map<string, Set<string>>();

    await OrchestratorHelper.processFile(testPath, path.basename(testPath), utterancesLabelsMap, utterancesDuplicateLabelsMap, false);

    Utility.debuggingLog(`OrchestratorTest.runAsync(), after calling OrchestratorHelper.processFile()`);
    // Utility.debuggingLog(`OrchestratorTest.runAsync(), JSON.stringify(utterancesLabelsMap)=${JSON.stringify(utterancesLabelsMap)}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), utterancesDuplicateLabelsMap=${utterancesDuplicateLabelsMap}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of unique utterances=${Object.keys(utterancesLabelsMap).length}`);
    Utility.debuggingLog(`OrchestratorTest.runAsync(), number of duplicate utterance/label pairs=${utterancesDuplicateLabelsMap.size}`);
    for (const utterance in utterancesLabelsMap) {
      const labelsPerUtterance: Array<string> = utterancesLabelsMap[utterance];
      if (labelsPerUtterance.length > 1) {
        Utility.debuggingLog(`OrchestratorTest.runAsync(), utterance "${utterance}" has more than 1 labels: ${labelsPerUtterance}`);
      }
    }
  }
}
