export default class OperationDocsHelper {
  static QUERY_GET_ALL() {
    return `
    query MyQuery {
      lab5_music {
        author
        genre
        name
      }
    }
  `;
  }

  static MUTATION_INSERT() {
    return `
    mutation MyMutation($author: String, $genre: String, $name: String) {
      insert_lab5_music_one(object: {name: $name, genre: $genre, author: $author}) {
        author
        genre
        name
      }
    }
  `;
  }

  static MUTATION_DELETE() {
    return `
    mutation MyMutation($id: Int) {
      delete_lab5_music(where: {id: {_eq: $id}}) {
        returning {
          name
          genre
          author
        }
      }
    }
  `;
  }
}
