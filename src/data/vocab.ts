import type { VocabItem } from '../types'
import hsk1 from '../../data/hsk1.json'
import hsk2 from '../../data/hsk2.json'
import hsk3 from '../../data/hsk3.json'
import hsk4 from '../../data/hsk4.json'
import hsk5 from '../../data/hsk5.json'
import hsk6 from '../../data/hsk6.json'
import hsk7 from '../../data/hsk7.json'
import hsk8 from '../../data/hsk8.json'
import hsk9 from '../../data/hsk9.json'

const vocab: VocabItem[] = [
  ...(hsk1 as VocabItem[]),
  ...(hsk2 as VocabItem[]),
  ...(hsk3 as VocabItem[]),
  ...(hsk4 as VocabItem[]),
  ...(hsk5 as VocabItem[]),
  ...(hsk6 as VocabItem[]),
  ...(hsk7 as VocabItem[]),
  ...(hsk8 as VocabItem[]),
  ...(hsk9 as VocabItem[]),
]

export default vocab
