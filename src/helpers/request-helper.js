import { token, errorMsg } from "../store";
import { get } from "svelte/store";
import config from "../auth-config";
import { FragmentsOnCompositeTypesRule } from "graphql";

class RequestHelper {
  constructor() {
    this.API_URL = config.API_URL;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(this.API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: {
        Authorization: `Bearer ${get(token)}`,
      },
    });

    return await result.json();
  }

  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      throw errors[0].message;
    }

    return data;
  }

  executeMyMutation(operationsDoc, variables = {}) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", variables);
  }

  async startExecuteMyMutation(operationsDoc, variables = {}) {
    const { errors, data } = await this.executeMyMutation(
      operationsDoc,
      variables,
    );

    if (errors) {
      console.log(errors);
      throw errors[0].message;
    }

    return data;
  }
}

export default new RequestHelper();
