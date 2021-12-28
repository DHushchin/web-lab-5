<script>
  import http from "./helpers/request-helper";
  import OperationDocsHelper from "./helpers/operation-docs-helper";
  import { music, token, isAuthenticated, user } from "./store";
  import { onMount } from "svelte";
  import auth from "./auth-service";

  token.subscribe(async (tokenValue) => {
    console.log(tokenValue);
    if (tokenValue !== "") {
      const { lab5_music } = await http.startFetchMyQuery(
        OperationDocsHelper.QUERY_GET_ALL(),
      );
      music.set(lab5_music);
    }
  });

  let auth0Client;

  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticated.set(await auth0Client.isAuthenticated());
    const accessToken = await auth0Client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
    }
    user.set(await auth0Client.getUser());
  });

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    token.set("");
    auth.logout(auth0Client);
  }

  const addSong = async () => {
    console.log(music);
    const name = prompt("Song name: ");
    const author = prompt("Author: ");
    const genre = prompt("Genre: ");
    try {
      const { insert_lab5_music } = await http.startExecuteMyMutation(
        OperationDocsHelper.MUTATION_INSERT_ONE(name, author, genre),
      );
      music.update((n) => [...n, insert_lab5_music.returning[0]]);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteSong = async () => {
    const nameEntered = prompt("Song name: ");
    const authorEntered = prompt("Author: ");
    await http.startExecuteMyMutation(OperationDocsHelper.MUTATION_DELETE(), {
      name: nameEntered,
      author: authorEntered,
    });
    music.update((n) =>
      n.filter(
        (song) => song.name != nameEntered && song.author != authorEntered,
      ),
    );
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      <button on:click={addSong}>Add song</button>
      <button on:click={deleteSong}>Delete song</button>
      <button on:click={logout}>Log out</button>
      <table border="2">
        <caption>Music</caption>
        <tr>
          <th>Name</th>
          <th>Author</th>
          <th>Genre</th>
          <th>UserId</th>
        </tr>
        {#each $music as song}
          <tr>
            <td>{song.name}</td>
            <td>{song.author}</td>
            <td>{song.genre}</td>
            <td>{song.user_id}</td>
          </tr>
        {/each}
      </table>
    {:else}
      <button on:click={login}>Log in</button>
    {/if}
  </div>
</main>

<style>
  main {
    margin: 0;
  }
</style>
