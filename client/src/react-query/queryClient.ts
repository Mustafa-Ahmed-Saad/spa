import { createStandaloneToast } from "@chakra-ui/react";
import { theme } from "../theme";

import { QueryClient } from "react-query";

//  we use createStandaloneToast instead of useToast hook because we need to use toast here and here not a component
const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : "error connecting to server";

  // prevent duplicate toasts
  toast.closeAll();
  toast({ title, status: "error", variant: "subtle", isClosable: true });
}

// to satisfy typescript until this file has uncommented contents
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // we will handel error globally here
      onError: queryErrorHandler,
      // we will set global options here but will override default options in appointments useQuery
      staleTime: 600000, // 10 minutes
      // don't make sense to make staleTime 10 minutes and cacheTime 5 minutes (default) so we should make cacheTime grater than staleTime
      cacheTime: 900000, // 15 minutes
      // @ts-ignore
      refetchOnMount: "false",
      // @ts-ignore
      refetchOnWindowFocus: "false",
      // @ts-ignore
      refetchOnReconnect: "false",
      // refetchInterval: 10000,
    },
  },
});
