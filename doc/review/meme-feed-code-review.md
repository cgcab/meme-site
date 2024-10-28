# Problem

1. The problem in the code was that first we were loading all the pages of memes causing a lot of queries on the first page.
2. Second problem was that for every comment and meme the author was queried everytime as if it was a new user.

# Solution

1. Load only the first page and add a system of page to load the next page or an infinite scroll solution
2. Use react-query's caching in order to save and stale the data and avoid asking the data over and over again.
