# Language Learning Web App — Claude Code Instructions

## Project Goal

Build a Mandarin Chinese language-learning web app focused on HSK 1–9 vocabulary.

The app should help learners browse vocabulary by HSK level, study words with examples and audio, and eventually record their own speech to receive feedback on pronunciation and accuracy.

This project should be built incrementally. Prioritise a clean MVP first, then add advanced speech feedback later.

---

## User Profile

The target learner is an English-speaking Mandarin learner who wants:

- HSK 1–9 vocabulary organised by level
- Simplified Chinese characters
- Pinyin with tone marks
- English definitions
- Example sentences
- Audio for each word and sentence
- Practice mode
- Speech recording and feedback on accuracy

The user prefers simplified Chinese.

---

## Important Product Principle

Do not hard-code HSK vocabulary directly in components.

Use a structured data source such as:

- `data/hsk-vocab.json`
- `data/hsk-vocab.csv`
- database seed file

Each vocabulary item should have a stable schema.

Example vocabulary object:

```json
{
  "id": "hsk1_0001",
  "hskLevel": 1,
  "simplified": "你好",
  "traditional": "你好",
  "pinyin": "nǐ hǎo",
  "pinyinNumbered": "ni3 hao3",
  "english": "hello",
  "partOfSpeech": "phrase",
  "examples": [
    {
      "chinese": "你好，我叫杰奇。",
      "pinyin": "Nǐ hǎo, wǒ jiào Jiéqí.",
      "english": "Hello, my name is Jacky."
    }
  ],
  "tags": ["greeting", "beginner"],
  "audio": {
    "wordAudioUrl": null,
    "exampleAudioUrls": []
  }
}