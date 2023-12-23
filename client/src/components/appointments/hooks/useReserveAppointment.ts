import { UseMutateFunction, useMutation, useQueryClient } from "react-query";
import { Appointment } from "../../../../../shared/types";
import { axiosInstance } from "../../../axiosInstance";
import { queryKeys } from "../../../react-query/constants";
import { useCustomToast } from "../../app/hooks/useCustomToast";
import { useUser } from "../../user/hooks/useUser";
import { queryClient } from "../../../react-query/queryClient";

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? "replace" : "add";
  const patchData = [{ op: patchOp, path: "/userId", value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// data that returned by the mutation function itself (in this case void) ,
// error that thrown by mutation function ,
// variables that the mutation fun expects (in this case appointment) ,
// context that onMutate set for optimistic update rollback in this case Appointment
export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();

  const queryClient = useQueryClient();

  // mutate function
  const { mutate } = useMutation(
    (appointment: Appointment) => setAppointmentUser(appointment, user?.id),
    {
      // if mutate done success then the data of query (queryKeys.appointments) will be invalid so this data of query (queryKeys.appointments) will be stale and react query will run ot triggers re-fetch if query currently being rendered
      onSuccess: () => {
        // we will invalidate any queries that have the prefix "queryKeys.appointments"
        // prefix here means that any query that starts with queryKeys.appointments.
        // so we will be invalidating any query that starts with queryKeys.appointments. for example if key like this [queryKeys.appointments] or like this [queryKeys.appointments, user] both will be invalidated because they start with key [queryKeys.appointments]
        // if we need to invalidate exact query we need to use {exact: true} option like this ([queryKeys.appointments, ..., ], {exact: true})
        // other queryCLient methods also take prefix like queryClient.removeQueries([queryKey])
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: "you have reserved the appointment",
          status: "success",
        });
      },
    }
  );

  console.log("mutate from useReserveAppointment", mutate);

  return mutate;
}
