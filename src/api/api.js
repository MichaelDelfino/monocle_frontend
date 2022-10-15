// Shared API call service

import Constants from '../constants/api.constants'

const call = (endpoint, options, callback) => {
     fetch(
        `${Constants.Server}/${endpoint}/${options}`
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
            callback(data)
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
}
export default call