import "./App.css";
import React, { useState } from "react";
import Help from "./Help";
import {
  SECTIONS_LIST,
  EXTERNAL_SECTION,
  SECTIONS_LIST_WITH_VALUE,
  EXTERNAL_SECTION_WITH_VALUE,
} from "./constant";
import {
  Switch,
  Stack,
  Alert,
  ChakraProvider,
  AlertIcon,
  Button,
  FormLabel,
  Box,
  Link,
  Input,
  Table,
  Thead,
  Tbody,
  Text,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

function App() {
  const [isHelpEnabled, setIsHelpEnabled] = useState(false);

  const AZURE_URL = "https://azure.microsoft.com/en-us/pricing/calculator/";
  const API_URL = "http://127.0.0.1:5000/add";

  const DEFAULT_FIXED = ["Development", "Training"];
  const SECTION_COLOURS = "blue.50";

  const [errorList, setErrorList] = useState([]);
  const [isResultView, setIsResultView] = useState(false);
  const [cost, setCost] = useState(null);

  const updateFlag = (sectionIndex, priceIndex, field, event) => {
    const newSectionsList = sectionList.map((section, sIndex) => {
      if (sIndex === sectionIndex) {
        return {
          ...section,
          spec: section.spec.map((price, pIndex) => {
            if (pIndex === priceIndex) {
              return {
                ...price,
                [field]: event
                  ? event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                  : !price[field],
              };
            }
            return price;
          }),
        };
      }
      return section;
    });

    setSectionList(newSectionsList);
  };

  const validatedPayload = () => {
    setErrorList([]);
    const error = [];
    // There should be external sections if external selection is on
    if (isExternalSelected) {
      const hasExternalSection = sectionList.some(
        (section) => section.isExternal
      );
      if (!hasExternalSection) {
        error.push("External section doesn't exist");
      }
    }

    // iteration test
    for (const section of sectionList) {
      for (const specItem of section.spec) {
        if (
          specItem.isFaas &&
          !DEFAULT_FIXED.includes(specItem.name) &&
          specItem.noOfIteration === 0
        ) {
          error.push("For FaaS , iteration must be greater than 0");
        }
      }
    }
    setErrorList(error);
    return error.length > 0 ? false : true;
  };

  const handleClick = () => {
    const isValidated = validatedPayload();
    if (isValidated) {
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionList),
      })
        .then((response) => {
          if (!response.ok) {
            setCost(null);
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setSectionList(data.data);
          var obj = {
            "Iteration Cost": data?.total_Cost_per_iteration,
            "Monthly Cost": data?.total_Cost_per_month,
            "Fixed Cost": data?.total_Fixed_cost,
          };
          setCost(obj);
          setIsResultView(true);
        })
        .catch((error) => {
          setErrorList(...{ error });
          console.log(error);
        });
    }
  };
  // Variables
  const [isExternalSelected, setIsExternalSelected] = useState(true);
  const [sectionList, setSectionList] = useState([
    ...SECTIONS_LIST_WITH_VALUE,
    EXTERNAL_SECTION_WITH_VALUE,
  ]);

  const handleToggle = () => {
    const isSectionExists = sectionList.some(
      (section) => section.name === EXTERNAL_SECTION_WITH_VALUE.name
    );

    if (isSectionExists) {
      // Remove the section
      const updatedSectionsList = sectionList.filter(
        (section) => section.name !== EXTERNAL_SECTION_WITH_VALUE.name
      );
      setSectionList(updatedSectionsList);
    } else {
      // Add the section
      setSectionList((prevSectionsList) => [
        ...prevSectionsList,
        EXTERNAL_SECTION_WITH_VALUE,
      ]);
    }
    setIsExternalSelected(!isExternalSelected);
  };

  return (
    <ChakraProvider>
      <Box w="100%" p={1} display={"flex"}>
        <Box w="50%" p={1} display={"flex"} justifyContent={"flex-start"}>
          {!isHelpEnabled && (
            <>
              <FormLabel htmlFor="section-type" mb="0">
                Enable external?
              </FormLabel>
              <Switch
                id="section-type"
                isChecked={isExternalSelected}
                onChange={handleToggle}
              />
            </>
          )}
        </Box>
        <Box w="50%" p={1} display={"flex"} justifyContent={"flex-end"}>
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={() => {
              setIsHelpEnabled(!isHelpEnabled);
            }}
          >
            {isHelpEnabled ? "Back" : "Help"}
          </Button>
        </Box>
      </Box>
      {!isHelpEnabled && (
        <Box w="100%" p={1} display={"flex"}>
          <FormLabel htmlFor="section-type" mb="0">
            Selected Type : {isExternalSelected ? "External" : "Internal"}
          </FormLabel>
        </Box>
      )}
      {isHelpEnabled ? (
        <Help />
      ) : (
        <div>
          {/* Table with all price points */}
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Price Section Name</Th>
                  {!isResultView && <Th>Fixed/Monthly</Th>}
                  {!isResultView && <Th>FaaS/PaaS</Th>}
                  {!isResultView && <Th>Price</Th>}
                  {!isResultView && <Th>Iteration</Th>}
                  {isResultView && <Th>Fixed Cost</Th>}
                  {isResultView && <Th>Monthly Cost</Th>}
                  {isResultView && <Th>Iteration Cost</Th>}
                  {!isResultView && <Th>Reference</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {sectionList.map((sectionItem, sectionIndex) => {
                  // Skip the section with index 4 if the external flag is true
                  if (!isExternalSelected && sectionItem.isExternal) {
                    return null;
                  }
                  return (
                    <React.Fragment key={sectionIndex}>
                      {sectionItem.spec.map((price, priceIndex) => (
                        <Tr key={priceIndex} bgColor={SECTION_COLOURS}>
                          <Td>{price.name}</Td>
                          {!isResultView && (
                            <Td>
                              <Switch
                                id={`${priceIndex}-isFixed`}
                                isChecked={price.isFixed}
                                onChange={() => {
                                  if (!DEFAULT_FIXED.includes(price.name)) {
                                    updateFlag(
                                      sectionIndex,
                                      priceIndex,
                                      "isFixed"
                                    );
                                  }
                                }}
                              />
                              <Text>{price.isFixed ? "Fixed" : "Monthly"}</Text>
                            </Td>
                          )}
                          {!isResultView && (
                            <Td>
                              <Switch
                                id={`${priceIndex}-isFaas`}
                                isChecked={price.isFaas}
                                onChange={() => {
                                  if (!DEFAULT_FIXED.includes(price.name)) {
                                    updateFlag(
                                      sectionIndex,
                                      priceIndex,
                                      "isFaas"
                                    );
                                  }
                                }}
                              />
                              <Text>{price.isFaas ? "FaaS" : "PaaS"}</Text>
                            </Td>
                          )}
                          {!isResultView && (
                            <Td>
                              <Input
                                placeholder="Enter Price"
                                onChange={(event) =>
                                  updateFlag(
                                    sectionIndex,
                                    priceIndex,
                                    "price",
                                    event
                                  )
                                }
                                value={price.price}
                                type="number"
                              />
                            </Td>
                          )}
                          {!isResultView && (
                            <Td>
                              <Input
                                disabled={
                                  !price.isFaas ||
                                  DEFAULT_FIXED.includes(price.name)
                                }
                                value={price.noOfIteration}
                                placeholder="Enter No Of iteration"
                                onChange={(event) =>
                                  updateFlag(
                                    sectionIndex,
                                    priceIndex,
                                    "noOfIteration",
                                    event
                                  )
                                }
                                type="number"
                              />
                            </Td>
                          )}
                          {isResultView && <Td>{price?.fixedCost}</Td>}
                          {isResultView && <Td>{price?.monthlyCost}</Td>}
                          {isResultView && <Td>{price?.iterationCost}</Td>}
                          {!isResultView && (
                            <Td>
                              {sectionItem.isExternal && (
                                <Link href={AZURE_URL} isExternal>
                                  Open Browser
                                </Link>
                              )}
                            </Td>
                          )}
                        </Tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Action Buttons */}
          <Stack direction="row" spacing={4} mt={4} mb={4}>
            {!isResultView && (
              <Button colorScheme="blue" variant="solid" onClick={handleClick}>
                Calculate
              </Button>
            )}
            <Button
              colorScheme="gray"
              variant="outline"
              onClick={() => {
                setIsExternalSelected(true);
                setSectionList([...SECTIONS_LIST, EXTERNAL_SECTION]);
                setIsResultView(false);
                setCost(null);
              }}
            >
              Reset
            </Button>
          </Stack>

          {/* Error Alerts */}
          <Stack spacing={3}>
            {errorList.map((error, index) => (
              <Alert status="error" key={index}>
                <AlertIcon />
                {error}
              </Alert>
            ))}
          </Stack>
          <Stack spacing={3}>
            {cost &&
              Object.entries(cost).map(([key, value]) => (
                <Alert status="success" key={key}>
                  <AlertIcon />
                  <strong>{key}:</strong> {value}
                </Alert>
              ))}
            {errorList.map((error, index) => (
              <Alert status="error" key={index}>
                <AlertIcon />
                {error}
              </Alert>
            ))}
          </Stack>
        </div>
      )}
    </ChakraProvider>
  );
}

export default App;
