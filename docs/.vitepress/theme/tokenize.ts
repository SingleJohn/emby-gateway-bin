/**
 * 本地搜索的中文分词。
 *
 * MiniSearch 默认按空白和标点切词，整句中文会被当成一个词，导致中文几乎搜不到。
 * 这里用 Intl.Segmenter 按词切分，建索引（构建期）和查询（浏览器端）必须用同一套规则。
 */
const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('zh-CN', { granularity: 'word' })
    : null

const FALLBACK = /[\s\p{P}\p{S}]+/u

export function tokenize(text: string): string[] {
  if (!segmenter) return text.split(FALLBACK).filter(Boolean)
  const out: string[] = []
  for (const s of segmenter.segment(text)) {
    if (s.isWordLike) out.push(s.segment)
  }
  return out
}
