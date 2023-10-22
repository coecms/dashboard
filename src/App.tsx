import { fetchUtils, Admin, Resource } from "react-admin";
import { UserList } from "./components/users";
import { UserPage } from "./components/userpage";
import { GroupList } from "./components/groups";
import { GroupPage } from "./components/grouppage";
import { MyLoginPage } from "./components/loginpage";
import { QueryClient } from "react-query";
import authProvider from "./auth"

import simpleRestProvider from "ra-data-simple-rest";

const httpClient = async ( url: string, options: fetchUtils.Options = {}) => {
  const authkey = localStorage.getItem('auth');
  const customHeaders = ( options.headers || new Headers({}) ) as Headers;
  if ( authkey ) {
    customHeaders.set("Authorization",authkey);
  }
  console.log(options.headers)
  options.headers = customHeaders;
  const { status, headers, body, json } = await fetchUtils.fetchJson(url,options);

  if ( status == 401 ) {
    localStorage.removeItem('auth');
    window.location.href = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '#/login';
  }

  return { status, headers, body, json }
}

export const dataProvider = simpleRestProvider(
  import.meta.env.VITE_SIMPLE_REST_URL, httpClient
);


export const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // This data is updated every 6 hours, the stale time can be very long
      },
    },
  });
  return (
    <Admin dataProvider={dataProvider} queryClient={queryClient} loginPage={MyLoginPage} authProvider={authProvider} requireAuth disableTelemetry>
      <Resource name="users" list={UserList} show={UserPage} />
      <Resource name="groups" list={GroupList} show={GroupPage} />
    </Admin>
  );
};
