# What does it do?

It uses XML files from Kitsu export and stores them in a SQLite database

# Why?

Well, SQLite databases are more flexible and workable than XML--- nvm, I did it for fun.  
The reason is "why not?"

# What now?

I might add a way to fetch anime names and ratings but that's for later.  
The reason is that some Kitsu titles aren't in MAL, resulting in malID being null and currently, I've no way to know what anime that was.  
I think I might just add a check and not add those titles at all, but we'll see about that

# How to run it?

You will need [deno](https://deno.land/) and also `sqlite3` CLI for now to run it.  
The command to run it is:  
```
sqlite3 kitsu.db < schema.sql
deno --allow-read --allow-write main.ts
```
That should do the trick! Enjoy this silly creation