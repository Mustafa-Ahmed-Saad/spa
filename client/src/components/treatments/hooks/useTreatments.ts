import { useQuery, useQueryClient } from "react-query";
import type { Treatment } from "../../../../../shared/types";
import { axiosInstance } from "../../../axiosInstance";
import { queryKeys } from "../../../react-query/constants";

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get("/treatments");
  return data;
}

export function useTreatments(): Treatment[] {
  // handel single call error 1/2
  // const toast = useCustomToast();

  // @ts-ignore
  const fallback = [];
  // @ts-ignore
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    // -------------------- we will make staleTime and cacheTime and other options global so we don't need to repeat them here
    // staleTime: 600000, // 10 minutes
    // don't make sense to make staleTime 10 minutes and cacheTime 5 minutes (default) so we should make cacheTime grater than staleTime
    // cacheTime: 900000, // 15 minutes
    // @ts-ignore
    // refetchOnMount: "false",
    // @ts-ignore
    // refetchOnWindowFocus: "false",
    // @ts-ignore
    // refetchOnReconnect: "false",
    // --------------------
    // @ts-ignore
    // handel single call error 2/2 | if handel single call error is exist and centralized error handling is exist this mean (single call error handling will override centralized error handling (default option))
    // error for single call (this call only) this mean (not centralized error handling)
    // onError: (error) => {
    //   const title =
    //     error instanceof Error
    //       ? error.toString().replace(/^Error:\s*/, "")
    //       : "error connecting to server";
    //   toast({
    //     title,
    //     status: "error",
    //   });
    // },
  });

  // ---------------------------------------------------------
  // we can store data in cache without call server | x key not exist so react query will create x and set "x" data in it (we can store any data we want even if it not from the server)
  // const queryClient = useQueryClient();
  // queryClient.setQueryData("x", "x");
  // ---------------------------------------------------------

  // @ts-ignore
  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, {
    // we need to repeat staleTime and cacheTime for prefetch (here) because if we don't do that we will get default staleTime and default cacheTime in prefetch
    // if we don't do that (make staleTime 10 minutes and cacheTime 5 minutes). when click logo (go to home page) will refetch treatments again
    // we will make staleTime and cacheTime and other options global so we don't need to staleTime and cacheTime here we repeat them only if that option (staleTime and cacheTime) is local (in useQuery options)
    // staleTime: 600000, // 10 minutes
    // cacheTime: 900000, // 15 minutes
  });
}
