import dayjs from "dayjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useQuery, useQueryClient } from "react-query";

import { axiosInstance } from "../../../axiosInstance";
import { queryKeys } from "../../../react-query/constants";
import { useUser } from "../../user/hooks/useUser";
import { AppointmentDateMap } from "../types";
import { getAvailableAppointments } from "../utils";
import { getMonthYearDetails, getNewMonthYear, MonthYear } from "./monthYear";

const commonOptions = {
  staleTime: 0,
  cacheTime: 300000,
};

// for useQuery call
async function getAppointments(
  year: string,
  month: string
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// The purpose of this hook:
//   1. track the current month/year (aka monthYear) selected by the user
//     1a. provide a way to update state
//   2. return the appointments for that particular monthYear
//     2a. return in AppointmentDateMap format (appointment arrays indexed by day of month)
//     2b. prefetch the appointments for adjacent monthYears
//   3. track the state of the filter (all appointments / available appointments)
//     3a. return the only the applicable appointments for the current monthYear
export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // get the monthYear for the current date (for default monthYear state)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // state to track current monthYear chosen by user
  // state value is returned in hook return object
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter to update monthYear obj in state when user changes month in view,
  // returned in hook return object
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */
  /** ****************** START 2: filter appointments  ****************** */
  // State and functions for filtering appointments to show all or only available
  const [showAll, setShowAll] = useState(false);

  // We will need imported function getAvailableAppointments here
  // We need the user to pass to getAvailableAppointments so we can show
  //   appointments that the logged-in user has reserved (in white)
  const { user } = useUser();
  // select function in useQuery only run if both (data changed and function has changed)
  // we useCallback to make it stable and not run every time we run the hook (because the function is going to change every time we run the hook so we useCallback)
  // we need to make selectFn stable so we use callback in selectFn to make it the same. when react query comparison select function and old select function it will be the same | but if we don't use callback the comparison between two function will be false always
  const selectFn = useCallback(
    // @ts-ignore
    (data) => getAvailableAppointments(data, user),
    [user]
  );
  /** ****************** END 2: filter appointments  ******************** */
  /** ****************** START 3: useQuery  ***************************** */
  // useQuery call for appointments for the current monthYear

  // TODO: update with useQuery!
  // Notes:
  //    1. appointments is an AppointmentDateMap (object with days of month
  //       as properties, and arrays of appointments for that day as values)
  //
  //    2. The getAppointments query function needs monthYear.year and
  //       monthYear.month

  const fallback = {};
  const { data: appointments = fallback } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      // select function only run if both (data changed and function has changed) so we make selectFn in callback
      // and if select function is equal old select function && data is equal old data it will not run select function
      // what select function do? is filter data
      // react query memoizes to reduce unnecessary computations and use triple equals to check if select function is the same and check if data is changed and if select fun is changed and if data is same and select fun is same react query not run select function so we use callback in selectFn (and that optimization that react query gives us)
      // so we need to make selectFn stable so we use callback in selectFn to make it the same. when react query comparison select function and old select function it will be the same if select fun not undefined | but if we don't use callback the comparison between two function will be false always
      select: showAll ? undefined : selectFn,
      // we need to override global options to make sure that available appointments update
      staleTime: 0,
      // don't make sense to make staleTime 10 minutes and cacheTime 5 minutes (default) so we should make cacheTime grater than staleTime
      cacheTime: 300000, // 5 minutes (default)
      // we can use (...commonOptions) instead of staleTime and cacheTime
      // @ts-ignore
      refetchOnMount: "true",
      // @ts-ignore
      refetchOnWindowFocus: "true",
      // @ts-ignore
      refetchOnReconnect: "true",
      // to update appointments every 60 seconds (to make sure that available appointments updated)
      refetchInterval: 60000, // 60 seconds
    }
  );

  /** ****************** END 3: useQuery  ******************************* */

  const queryClient = useQueryClient();

  useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    queryClient.prefetchQuery(
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      {
        // we need to repeat staleTime and cacheTime like above (useQuery appointments) because if we don't do that we will get global options staleTime and cacheTime in prefetch
        staleTime: 0,
        cacheTime: 300000,
        // we can use (...commonOptions) instead of staleTime and cacheTime
      }
    );
  }, [queryClient, monthYear]);

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}
