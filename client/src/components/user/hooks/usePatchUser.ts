import jsonpatch from "fast-json-patch";

import type { User } from "../../../../../shared/types";
import { axiosInstance, getJWTHeader } from "../../../axiosInstance";
import { useUser } from "./useUser";
import {
  QueryClient,
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "react-query";
import { useCustomToast } from "../../app/hooks/useCustomToast";
import { queryKeys } from "../../../react-query/constants";

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    }
  );
  return data.user;
}

// update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // we should send token or user id to back end make sure that user loged in
  // rename mutate function to patchUser
  const { mutate: patchUser } = useMutation(
    // mutate function here is this arrow function
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // this argument newData in onMutate is the argument newUserData of mutate function. [(newUserData or any parameter) in mutate function = (newData -or same parameter of mutate fun-) in onMutate]
      onMutate: async (newData: User | null) => {
        // this request of this query should cancelable to make cancel iy using cancelQueries fun
        // cancel any outgoing queries from user data, so old server data doesn't overwrite our optimistic update
        queryClient.cancelQueries(queryKeys.user);

        // snapshot of previous User value
        // @ts-ignore
        const prevUserData: User = queryClient.getQueryData(queryKeys.user);

        // optimistic update here mean that we will update query data before data return from server and before knowing that request success or field
        // optimistic update user query cash with new user value
        // we don't need write this line (queryClient.setQueryData([queryKeys.user], newData);) because updateUser do it and another proccess
        // @ts-ignore
        updateUser(newData);

        // onMutate return context that is passed to onError
        // return context object with snapshotted value
        // return prev User data to pass it as argument to onError (if error)
        return { prevUserData: prevUserData };
      },

      // prevUserDataContext that value that returned from onMutate
      onError: (error, newDate, prevUserDataContext) => {
        // roll back user data if error. (roll back cache to saved value)
        if (prevUserDataContext?.prevUserData) {
          updateUser(prevUserDataContext?.prevUserData);
          toast({
            title: "update failed restoring previous values",
            status: "warning",
          });
        }
      },

      // that userData parameter here returned from mutate function
      onSuccess: (userData: User | null) => {
        // here we don't need to invalid any query because updateUser will change user in cache and in local storage and triger or run user query.
        if (user) {
          // we don't need this line here (updateUser(userData);) because we do it in onMutate (when optimistic update)
          toast({
            title: "user updated",
            status: "success",
          });
        }
      },

      onSettled: () => {
        // invalidateQueries clear the cache and triger refetch
        // invalid user query to make sure we are in sync with server data
        // invalid user query to make sure async user info from server (we can don't do this but i think better to do it)
        queryClient.invalidateQueries(queryKeys.user);
      },
    }
  );

  // @ts-ignore
  return patchUser;
}
