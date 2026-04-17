SELECT
	first(block), list({ 'id': id, 'before': before, 'text': text, 'after': after })
FROM (
	SELECT
		id,
		sum(case when tag is null then 0 else 1 end) over (order by id) as n,
		tag,
		t
	FROM (
		SELECT
			id,
			tag,
			depth,
			attrs,
			before || text || after AS t
		FROM word w
		LEFT JOIN block b ON b.doc = w.doc AND b.word = w.id AND tag NOT IN ('c')
		ORDER by w.id
	)
)
group by block_partition
order by block_partition
