import axios from "axios";
import * as $ from "jquery";
import { ajax } from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface IEpisodes {
  id: number;
  name: String;
  season: String;
  number: String;
}

interface IShowFromApi {
  id: number;
  name: String;
  summary: String;
  image?: { original: String } | null;
}

interface IShow {
  id: number;
  name: String;
  summary: String;
  image?: String;
}

async function getShowsByTerm(term: String): Promise<IShow[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  let results: { data: { show: IShowFromApi }[] } = await axios.get(
    `https://api.tvmaze.com/search/shows?q=${term}`
  );
  console.log(results.data);

  return results.data.map((result: { show: IShowFromApi }): IShow => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image?.original || `https://tinyurl.com/tv-missing`,
    };
  });
}

// return [
//   {
//     id: 1767,
//     name: "The Bletchley Circle",
//     summary:
//       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
//          women with extraordinary skills that helped to end World War II.</p>
//        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
//          normal lives, modestly setting aside the part they played in
//          producing crucial intelligence, which helped the Allies to victory
//          and shortened the war. When Susan discovers a hidden code behind an
//          unsolved murder she is met by skepticism from the police. She
//          quickly realises she can only begin to crack the murders and bring
//          the culprit to justice with her former friends.</p>`,
//     image:
//         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
//   }
// ]

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: IShow[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term: String);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<IEpisodes[]> {
  let results = await axios.get(` http://api.tvmaze.com/shows/${id}/episodes`);
  console.log(results);
  return results.data.map((result: IEpisodes): IEpisodes => {
    return {
      id: result.id,
      name: result.name,
      season: result.season,
      number: result.number,
    };
  });
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: IEpisodes[]) {
  $showsList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>
      <div data-episode-id="${episode.id}" class="episode col-md-12 col-lg-6 mb-4">
         <div class="media">
           <div class="media-body">
             <h5 class="text-primary">${episode.name}</h5>
             <div><small>${episode.number}</small></div>
             <button class="btn btn-outline-light btn-sm episode-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
       <li/>
      `
    );

    $episodesList.append($episode);
  }
  $episodesArea.show();
}
