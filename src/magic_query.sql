WITH t1 AS (
SELECT tracking, csidedata->'hole_1'->'cDia' AS hole_1, 
	csidedata->'hole_2'->'cDia' as hole_2
FROM parts),

t2 AS (
SELECT tracking, GREATEST(t1.hole_1, t1.hole_2) AS latest
FROM t1
)

SELECT t1.tracking, CASE WHEN t1.hole_1 = t2.latest THEN 'hole_1'
						WHEN t1.hole_2 = t2.latest THEN 'hole_2'
						END AS max_hole,
						t2.latest AS max_dia

FROM t1
JOIN t2
ON t1.tracking = t2.tracking