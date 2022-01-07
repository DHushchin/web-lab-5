<script>
  import http from "./helpers/request-helper";
  import OperationDocsHelper from "./helpers/operation-docs-helper";
  import {
    music,
    token,
    isAuthenticated,
    user,
    spinnersAmount as spinnerAmount,
    errorMsg,
    spinnersAmount,
  } from "./store";
  import { onMount } from "svelte";
  import auth from "./auth-service";
  import { Jumper } from "svelte-loading-spinners";

  let errorValue, spinnervalue, addDisableFlag, deleteDisableFlag, auth0Client;
  const tableInfo = {};
  errorMsg.subscribe((msg) => {
    errorValue = msg;
  });
  spinnerAmount.subscribe((amount) => {
    spinnervalue = amount;
  });

  token.subscribe(async (tokenValue) => {
    try {
      if (tokenValue !== "") {
        const { lab5_music } = await http.startFetchMyQuery(
          OperationDocsHelper.QUERY_GET_ALL(),
        );
        music.set(lab5_music);
      }
    } catch (err) {
      errorMsg.set(`Error -> ${err}`);
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
    console.error(err);
  }

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    $token = "";
    auth.logout(auth0Client);
  }

  function changeFlag(disable, msg = "") {
    if (disable) {
      spinnerAmount.update((n) => n + 1);
    } else {
      spinnerAmount.update((n) => n - 1);
    }

    if (msg) {
      errorMsg.set(msg);
    }

    return disable;
  }

  const addSong = async () => {
    if (!tableInfo.name || !tableInfo.author || !tableInfo.genre) {
      addDisableFlag = changeFlag(false, "Adding empty values is not allowed!");
      return;
    }

    addDisableFlag = changeFlag(true);

    try {
      const { insert_lab5_music } = await http.startExecuteMyMutation(
        OperationDocsHelper.MUTATION_INSERT_ONE(
          tableInfo.name,
          tableInfo.author,
          tableInfo.genre,
        ),
      );
      music.update((n) => [...n, insert_lab5_music.returning[0]]);
    } catch (err) {
      addDisableFlag = changeFlag(false, `Error -> ${err}`);
      return;
    }
    addDisableFlag = changeFlag(false, " ");
  };

  const deleteSong = async () => {
    if (!tableInfo.name || !tableInfo.author) {
      deleteDisableFlag = changeFlag(
        false,
        "Deleting empty values is not allowed!",
      );
      return;
    }

    if (tableInfo.genre) {
      deleteDisableFlag = changeFlag(false, "Genre should be empty!");
      return;
    }
    deleteDisableFlag = changeFlag(true);

    try {
      await http.startExecuteMyMutation(OperationDocsHelper.MUTATION_DELETE(), {
        name: tableInfo.name,
        author: tableInfo.author,
      });
      music.update((n) =>
        n.filter(
          (song) =>
            song.name != tableInfo.name || song.author != tableInfo.author,
        ),
      );
    } catch (err) {
      deleteDisableFlag = changeFlag(false, `Error -> ${err}`);
      return;
    }

    deleteDisableFlag = changeFlag(false, " ");
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      {#if $music.loading}
        <div>Loading...</div>
        <Jumper size="60" color="#FF3E00" />
      {:else if $music.error}
        <div>Error! Something went wrong...</div>
      {:else if $music}
        <div>
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
        <table border="2">
          <caption><h1>Your playlist!</h1></caption>
          <tr>
            <th>Name</th>
            <th>Author</th>
            <th>Genre</th>
            <th>UserId</th>
          </tr>
          {#each $music as song (song.id)}
            <tr>
              <td>{song.name}</td>
              <td>{song.author}</td>
              <td>{song.genre}</td>
              <td>{song.user_id}</td>
            </tr>
          {/each}
        </table>
        <p>{errorValue}</p>
        <div style="visibility:{spinnervalue > 0 ? 'visible' : 'hidden'}">
          <Jumper size="60" color="#FF3E00" />
        </div>
      {/if}
    {:else}
      <button on:click={login}>Log in</button>
      <p>{errorValue}</p>
    {/if}
  </div>
</main>

<style>
  main {
    margin: 0;
  }
</style>
