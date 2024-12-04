import { OrderedList, ListItem, Stack } from "@chakra-ui/react";

function Help() {
  return (
    <OrderedList ml={5}>
      <ListItem>
        Choose "enable external" to do the calculations including the external
        costs else NOT choose this option.
      </ListItem>
      <ListItem>
        Select monthly/fixed and PAAS/FAAS for each of the cost listed.
      </ListItem>
      <ListItem>
        Fill in the cost for each of them including the iterations, wherever
        applicable.
      </ListItem>
      <ListItem>Press "calculate" to get the results.</ListItem>
      <ListItem>Press "reset" to go back to the initial state.</ListItem>
    </OrderedList>
  );
}
export default Help;
