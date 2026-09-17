const helpers = {
    httpGet: async function (url, Token) {
      try {
        const data = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + Token,
            'X-Tenant-ID' : window.location.hostname
          },

        });
        return await data.json();
      } catch (error) {
        console.error(error);
      }
    },
    // httpPostToken: async function (url, data, Token) {
    //   return this.httpPost(url, Token, data);
    // },
    httpPost: async function (url, data, Token) {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
  
        if (Token) {
          headers.Authorization = 'Token ' + Token;
        }

        headers['X-Tenant-ID'] = window.location.hostname
  
        const DATA = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
        });
  
        return await DATA.json();
      } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to handle it in the calling function
      }
    },

    httpPut: async function (url, data, Token) {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
  
        if (Token) {
          headers.Authorization = 'Token ' + Token;
        }
        headers['X-Tenant-ID'] = window.location.hostname
  
        const DATA = await fetch(url, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(data),
        });
  
        return await DATA.json();
      } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to handle it in the calling function
      }
    },


  
    httpDelete: async function (url, Token) {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
  
        if (Token) {
          headers.Authorization = 'Token ' + Token;
        }
        headers['X-Tenant-ID'] = window.location.hostname
  
        const DATA = await fetch(url, {
          method: 'DELETE',
          headers: headers,
        });
       
        return await DATA.json();
      } catch (error) {
        console.error(error);
      }
    },
  };
  export default helpers;