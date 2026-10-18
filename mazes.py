A="""###################
#........#........#
#o##.###.#.###.##o#
#.................#
#.##.#.#####.#.##.#
#....#...#...#....#
####.###_#_###.####
xxx#.#_______#.#xxx
####.#_##-##_#.####
____.__#PPP#__.____
####.#_#####_#.####
xxx#.#_______#.#xxx
####.#_#####_#.####
#........#........#
#.##.###.#.###.##.#
#o.#.....S.....#.o#
##.#.#.#####.#.#.##
#....#...#...#....#
#.######.#.######.#
#.................#
###################"""
B="""###################
#o...#.......#...o#
#.##.#.#####.#.##.#
#.................#
##.##.###.###.##.##
x#.#...........#.#x
x#.#.#_##-##_#.#.#x
##.#.#_#PPP#_#.#.##
__.#.#_#####_#.#.__
##.#.._______..#.##
x#.###.#####.###.#x
x#...............#x
##.##.###.###.##.##
#.................#
#.##.#.#.#.#.#.##.#
#o.#...#.S.#...#.o#
##.#.###.#.###.#.##
#.................#
#.####.##.##.####.#
#.................#
###################"""
import json
for name,m in (('A',A),('B',B)):
  rows=m.split('\n');assert len(rows)==21,(name,len(rows))
  for i,r in enumerate(rows):assert len(r)==19,(name,i,len(r),r)
  for r in rows:assert r==r[::-1].replace('S','.') or 'S' in r,(name,r)
  walk=lambda c:c in '._oS-P'
  sr=[i for i,r in enumerate(rows) if 'S' in r][0];sc=rows[sr].index('S')
  seen={(sr,sc)};st=[(sr,sc)]
  while st:
    y,x=st.pop()
    for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
      ny,nx=y+dy,(x+dx)%19
      if 0<=ny<21 and walk(rows[ny][nx]) and rows[ny][nx] not in '-P' and (ny,nx) not in seen:seen.add((ny,nx));st.append((ny,nx))
  dots=[(y,x) for y in range(21) for x in range(19) if rows[y][x] in '.o']
  un=[d for d in dots if d not in seen];print(name,'dots',len(dots),'unreached',un)
  de=[]
  for (y,x) in seen:
    n=sum(1 for dy,dx in((1,0),(-1,0),(0,1),(0,-1)) if 0<=y+dy<21 and walk(rows[y+dy][(x+dx)%19]) and rows[y+dy][(x+dx)%19]!='P')
    if n<=1:de.append((y,x))
  print(' deadends',de)
  # door above
  dr=[i for i,r in enumerate(rows) if '-' in r][0];dc=rows[dr].index('-');print(' door',dr,dc,'above',rows[dr-1][dc])
json.dump({'A':A.split('\n'),'B':B.split('\n')},open('mazes.json','w'))
