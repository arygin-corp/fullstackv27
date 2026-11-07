def chunk_text(text, chunk_size, overlap):
    if chunk_size <= overlap: raise ValueError("chunk_size must be greater than overlap")
    normalized=" ".join(text.split())
    if not normalized: return []
    chunks=[]; start=0
    while start < len(normalized):
        end=min(start+chunk_size,len(normalized)); chunks.append(normalized[start:end])
        if end==len(normalized): break
        start=end-overlap
    return chunks
