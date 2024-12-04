from typing import List, Dict, Tuple, Any

class CostCalculator:
    def calculate_each_section(self, eachItem: Dict[str, Any]) -> Tuple[Dict[str, Any], float, float, float]:
        iteration_cost_per_section = 0
        monthly_cost_per_section = 0
        fixed_cost_per_section = 0

        for price in eachItem["spec"]:
            # Get inputs for cost & service Type
            isFixed = price['isFixed']
            isFaaS = price['isFaas']

            # Case1: Monthly FAAS - cost/iteration
            if not isFixed and isFaaS:
                cost_per_month = price['price']
                no_of_iteration_monthly = price['noOfIteration']
                if no_of_iteration_monthly != 0:
                    price['iterationCost'] = (cost_per_month / no_of_iteration_monthly)
                else:
                    price['iterationCost'] = 0  # Avoid division by zero
                # Adding to section cost
                iteration_cost_per_section += price['iterationCost']

            elif isFixed and isFaaS:
                # Case2: Fixed FAAS - cost/month and cost/iteration
                if price['name'] in ["Development", "Training"]:
                    price['fixedCost'] = price['price']
                    fixed_cost_per_section += price['fixedCost']
                else:
                    fixed_cost = price['price']
                    no_of_iterations = price['noOfIteration']
                    if no_of_iterations != 0:
                        price['iterationCost'] = fixed_cost / no_of_iterations
                    else:
                        price['iterationCost'] = 0  # Avoid division by zero
                    price['monthlyCost'] = fixed_cost

                    # Yearly cost & yearly iteration no, to be divided by fixed cost per year
                    monthly_cost_per_section += price['monthlyCost']
                    iteration_cost_per_section += price['iterationCost']

            else:
                # Case3 and Case4: Fixed PaaS and Monthly PaaS - cost/month
                # value entered is monthly cost by default
                price['monthlyCost'] = price['price']
                # Adding to section cost
                monthly_cost_per_section += price['monthlyCost']

        return eachItem, iteration_cost_per_section, monthly_cost_per_section, fixed_cost_per_section

    def calculate_cost(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Start calculation
        total_Cost_per_iteration = 0
        total_Cost_per_month = 0
        total_Fixed_cost = 0

        for eachItem in data:
            eachItem, iteration_cost, monthly_cost, fixed_cost = self.calculate_each_section(eachItem)
            total_Cost_per_iteration += iteration_cost
            total_Cost_per_month += monthly_cost
            total_Fixed_cost += fixed_cost

        # Return the JSON payload as a response
        costs = {
            'total_Cost_per_iteration': total_Cost_per_iteration,
            'total_Cost_per_month': total_Cost_per_month,
            'total_Fixed_cost': total_Fixed_cost,
            'data': data,
        }
        return costs
