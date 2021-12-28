export default class OperationDocsHelper {
  static QUERY_GET_ALL() {
    return `
    query MyQuery {
      lab5_music {
        id
        name
        author
        genre
        user_id
      }
    }
  `;
  }

  static MUTATION_INSERT_ONE(name, author, genre) {
    return `
    mutation MyMutation {
    insert_lab5_music(objects: {name: "${name}", author: "${author}", genre: "${genre}"}) {
      returning {
        id
        name
        author
        genre
        user_id
      }
    }
   }
  `;
  }

  static MUTATION_DELETE() {
    return `
    mutation MyMutation($name: String, $author: String) {
    delete_lab5_music(where: {name: {_eq: $name}, _and: {author: {_eq: $author}}}) {
      returning {
        id
        name
        author
        genre
        user_id
      }
    }
  }
  `;
  }
}
