import { Dispatch, SetStateAction, useCallback, useState } from "react";

import type { Staff } from "../../../../../shared/types";
import { axiosInstance } from "../../../axiosInstance";
import { queryKeys } from "../../../react-query/constants";
import { filterByTreatment } from "../utils";
import { useQuery } from "react-query";

// for when we need a query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get("/staff");
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState("all");

  const selectFn = useCallback(
    // @ts-ignore
    (unfilteredTreatments) => filterByTreatment(unfilteredTreatments, filter),
    [filter]
  );

  // @ts-ignore
  const fallback = [];
  // @ts-ignore
  const { data: staff = fallback } = useQuery(queryKeys.staff, getStaff, {
    // staleTime: 5000,
    // what select function do? is filter data
    select: filter === "all" ? undefined : selectFn,
  });

  // @ts-ignore
  return { staff, filter, setFilter };
}
