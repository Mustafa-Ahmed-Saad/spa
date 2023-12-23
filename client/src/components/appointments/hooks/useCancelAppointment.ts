import { UseMutateFunction, useMutation, useQueryClient } from "react-query";
import { Appointment } from "../../../../../shared/types";
import { axiosInstance } from "../../../axiosInstance";
import { queryKeys } from "../../../react-query/constants";
import { useCustomToast } from "../../app/hooks/useCustomToast";

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: "remove", path: "/userId" }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// TODO: update return type
export function useCancelAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  // mutate function
  const { mutate } = useMutation(
    // we can remove this line and write removeAppointmentUser only and appointment will passed to it
    (appointment: Appointment) => removeAppointmentUser(appointment),
    {
      onSuccess: () => {
        // we will invalidate any queries that have the prefix "queryKeys.appointments" and this will include appointments for this month and user appointments
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: "you have canceled the appointment",
          status: "warning",
        });
      },
    }
  );

  return mutate;
}
