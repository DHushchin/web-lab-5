<script>
  import http from "./helpers/request-helper";
  import OperationDocsHelper from "./helpers/operation-docs-helper";
  import {
    music,
    token,
    isAuthenticated,
    user,
    spinnersAmount,
    errorMsg,
  } from "./store";
  import { onMount } from "svelte";
  import auth from "./auth-service";
  import { Circle3 } from "svelte-loading-spinners";

  let addDisableFlag = false,
    deleteDisableFlag = false,
    auth0Client;
  const tableInfo = {};

  token.subscribe(async (tokenValue) => {
    try {
      if (tokenValue !== "") {
        const { lab5_music } = await http.startFetchMyQuery(
          OperationDocsHelper.QUERY_GET_ALL(),
        );
        music.set(lab5_music);
      }
    } catch (err) {
      $errorMsg = `Error -> ${err}`;
    }
  });

  try {
    onMount(async () => {
      auth0Client = await auth.createClient();
      isAuthenticated.set(await auth0Client.isAuthenticated());
      const accessToken = await auth0Client.getIdTokenClaims();
      if (accessToken) {
        $token = accessToken.__raw;
      }

      user.set(await auth0Client.getUser());
    });
  } catch (err) {
    $errorMsg = err;
  }

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    $token = "";
    auth.logout(auth0Client);
  }

  const stringToNumber = (string) => {
    return isNaN(+string) ? 0 : +string;
  };

  function changeFlag(disable, msg = "") {
    if (disable) {
      $spinnersAmount++;
    } else {
      $spinnersAmount--;
    }

    if (msg) {
      $errorMsg = msg;
    }

    return disable;
  }

  const addSong = async () => {
    addDisableFlag = changeFlag(true);

    if (!tableInfo.name || !tableInfo.author || !tableInfo.genre) {
      addDisableFlag = changeFlag(false, "Adding empty values is not allowed!");
      return;
    }
    if (tableInfo.id) {
      addDisableFlag = changeFlag(false, "ID is generated automatically!");
      return;
    }

    try {
      const { insert_lab5_music_one } = await http.startExecuteMyMutation(
        OperationDocsHelper.MUTATION_INSERT(),
        {
          name: tableInfo.name,
          author: tableInfo.author,
          genre: tableInfo.genre,
        },
      );

      music.update((n) => [...n, insert_lab5_music_one]);
    } catch (err) {
      addDisableFlag = changeFlag(false, `Error -> ${err}`);
      return;
    } finally {
      for (var member in tableInfo) tableInfo[member] = "";
    }

    addDisableFlag = changeFlag(false, " ");
  };

  const deleteSong = async (removeId) => {
    deleteDisableFlag = changeFlag(true);
    try {
      await http.startExecuteMyMutation(OperationDocsHelper.MUTATION_DELETE(), {
        id: removeId,
      });
      music.update((n) => n.filter((song) => song.id != tableInfo.id));
    } catch (err) {
      deleteDisableFlag = changeFlag(false, `Error -> ${err}`);
      return;
    } finally {
      for (var member in tableInfo) tableInfo[member] = "";
    }
    deleteDisableFlag = changeFlag(false, " ");
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      {#if $music.loading}
        <div>Loading...</div>
        <Circle3 />
      {:else if $music.error}
        <div>Error! Something went wrong...</div>
      {:else if $music}
        <div>
          <input bind:value={tableInfo.id} placeholder="ID" />
          <input bind:value={tableInfo.name} placeholder="Name" />
          <input bind:value={tableInfo.author} placeholder="Author" />
          <input bind:value={tableInfo.genre} placeholder="Genre" />
        </div>
        <div>
          <button on:click={addSong} disabled={addDisableFlag}>Add song</button>
          <button on:click={deleteSong} disabled={deleteDisableFlag}
            >Delete song</button
          >
          <button on:click={logout}>Log out</button>
        </div>
        {#if $music.length}
          <table border="2">
            <caption><h1>Your playlist!</h1></caption>
            <tr>
              <th>Name</th>
              <th>Author</th>
              <th>Genre</th>
            </tr>
            {#each $music as song (song.id)}
              <tr>
                <td>{song.name}</td>
                <td>{song.author}</td>
                <td>{song.genre}</td>
                <td>
                  <button
                    on:click={() => deleteSong(song.id)}
                    disabled={deleteDisableFlag}>Delete song</button
                  >
                </td>
              </tr>
            {/each}
          </table>
        {:else}
          <h2>Your playlist is empty. Add something!</h2>
        {/if}
        <p>{$errorMsg}</p>
        <div class="spinner" class:visible={!$spinnersAmount}>
          <Circle3 />
        </div>
      {/if}
    {:else}
      <button on:click={login}>Log in</button>
      <p>{$errorMsg}</p>
    {/if}
  </div>
</main>

<style>
  main {
    margin: 0;
  }

  .visible {
    visibility: hidden;
  }
</style>
