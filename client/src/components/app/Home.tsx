import { Icon, Stack, Text } from "@chakra-ui/react";
import { ReactElement } from "react";
import { GiFlowerPot } from "react-icons/gi";

import { BackgroundImage } from "../common/BackgroundImage";
import { usePrefetchTreatments } from "../treatments/hooks/useTreatments";

export function Home(): ReactElement {
  // we can't use usePrefetchTreatments() inside useEffect because it is a hook and we can't make usePrefetchTreatments not a hook because it is a hook we need use the useQueryClient() inside it
  usePrefetchTreatments();

  return (
    <Stack textAlign="center" justify="center" height="84vh">
      <BackgroundImage />
      <Text textAlign="center" fontFamily="Forum, sans-serif" fontSize="6em">
        <Icon m={4} verticalAlign="top" as={GiFlowerPot} />
        Lazy Days Spa
      </Text>
      <Text>Hours: limited</Text>
      <Text>Address: nearby</Text>
    </Stack>
  );
}
