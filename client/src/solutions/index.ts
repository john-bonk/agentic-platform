/**
 * Solution registry
 *
 * Imports each solution's `SolutionDefinition` and registers it with the
 * framework. Importing this module registers all solutions as a side effect;
 * it is imported once at app startup.
 *
 * Adding a new solution:
 *   1. Author its definition file in `client/src/solutions/<id>.ts`.
 *   2. Import + register here.
 *   3. Wire any additional UI surfaces per the registration walkthrough in
 *      `docs/solution-framework.md` Part 7.
 */

import { registerSolution } from "@/lib/solutionFramework";
import { soxControlTestingSolution } from "./sox-control-testing";
import { tprmSolution } from "./tprm";
import { auditAssessmentSolution } from "./audit-assessment";

// Register canon-compliant solutions. Each call validates the definition;
// validation failures throw at startup so they're caught immediately.
registerSolution(soxControlTestingSolution);
registerSolution(tprmSolution);
registerSolution(auditAssessmentSolution);

export { soxControlTestingSolution, tprmSolution, auditAssessmentSolution };
