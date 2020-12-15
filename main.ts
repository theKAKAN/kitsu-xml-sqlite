// I'M SORRY, MY FUTURE SELF

import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { parse as parseDate } from 'https://deno.land/std/datetime/mod.ts'
import { DB } from "https://deno.land/x/sqlite/mod.ts";


// This assumes that you've already created the database with the correct
// schema. If not, run `sqlite3 kitsu.db < schema.sql` to create it
const db = new DB("./kitsu.db");
// I wanted to execute the schema file directly here, but there seems to be
// some problem with this module which doesn't let me execute two statements
// in one query. That's also why it queries/inserts each row one by one instead
// of doing so in a single transaction


const animeLibrary = parse(await Deno.readTextFile('./kitsu-KAKAN-anime.xml')),
	mangaLibrary = parse(await Deno.readTextFile('./kitsu-KAKAN-manga.xml'));

writeToSqlite( "anime", animeLibrary?.root?.children ?? [] );
writeToSqlite( "manga", mangaLibrary?.root?.children ?? [] );

function writeToSqlite( table: string, data: Array<any> )
{
	data.forEach( function( val: any ){
		val = val?.children ?? [
		    { name: "series_animedb_id", attributes: {}, children: [], content: "" },
    		{ name: "my_watched_episodes", attributes: {}, children: [], content: "" },
    		{ name: "my_start_date", attributes: {}, children: [], content: "" },
    		{ name: "my_finish_date", attributes: {}, children: [], content: "" },
    		{ name: "my_score", attributes: {}, children: [], content: "" },
    		{ name: "my_status", attributes: {}, children: [], content: "" },
    		{ name: "my_times_watched", attributes: {}, children: [], content: "" },
    		{ name: "update_on_import", attributes: {}, children: [], content: "" }
		];
		const defaultValues: any = {
			"series_animedb_id": null,
			"my_watched_episodes": 0,
			"my_start_date": null,
			"my_read_chapters": 0,
			"my_read_volumes": 0,
			"my_finish_date": null,
			"my_score": 0,
			"my_status": "Plan to Watch",
			"my_times_watched": 0
		}
		// Replace the default values with functional ones
		val.forEach( function( dict: any ){
			// Because I love torturing myself
			const dictName: string = dict?.name ?? "",
				content: string | null = dict?.content ?? null;
			defaultValues[ dictName ] = content
		});

		// Details that shouldn't be a string
		const malId: number = parseInt(defaultValues["series_animedb_id"] ?? defaultValues["manga_mangadb_id"] ),
			score: number = parseInt( defaultValues["my_score"] ),
			// Anime specific
			watchedEpisodes: number = parseInt( defaultValues["my_watched_episodes"] ),
			rewatchTimes: number = parseInt( defaultValues["my_times_watched"] ),
			// For manga
			readChapters: number = parseInt( defaultValues["my_read_chapters"] ),
			readVolumes: number = parseInt( defaultValues["my_read_volumes"] ),
			readTimes: number = parseInt( defaultValues["my_times_read"] );

		// If there's no finish data, make one
		defaultValues.my_finish_date = defaultValues.my_finish_date ?? defaultValues.my_start_date;

		if( table == "anime" )
		{
			var transaction: string = "INSERT INTO animeStatus( malId, watchedEpisodes, startDate, finishDate, score, status, timesWatched )";
			transaction += "VALUES( ?, ?, ?, ?, ?, ?, ?)";
			db.query( transaction, [ malId, watchedEpisodes, defaultValues.my_start_date,
										defaultValues.my_finish_date, score, defaultValues.my_status, rewatchTimes ]);
		}
		if( table == "manga" )
		{
			var transaction: string = "INSERT INTO mangaStatus( malId, readChapters, readVolumes, startDate, finishDate, score, status, timesRead )";
			transaction += "VALUES( ?, ?, ?, ?, ?, ?, ?, ? )";
			db.query( transaction, [ malId, readChapters, readVolumes, defaultValues.my_start_date,
										defaultValues.my_finish_date, score, defaultValues.my_status, readTimes ]);
		}
	});
	console.log( table + " query completed");
}