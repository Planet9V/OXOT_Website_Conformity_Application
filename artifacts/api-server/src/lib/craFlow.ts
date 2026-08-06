/**
 * CRA conformity flow definition — served to the wizard as data so the UI can
 * render the questionnaire generically and every path is computed here, not
 * hardcoded in React. The engine is regulation-agnostic; only the CRA flow is
 * defined today. Classification and routing are computed by the pure functions
 * below from the captured answers (scoping/classification) plus the reference
 * layer's routes (route resolution lives in conformityEngine.ts).
 *
 * Grounding: Regulation (EU) 2024/2847 (Cyber Resilience Act). Article/Annex
 * citations are attached to each question so the UI can show provenance. This is
 * decision-support, not legal advice.
 */

export type FlowQuestion = {
  key: string;
  title: string;
  help?: string;
  citation: string;
  /** For scoping questions: which boolean answer keeps the product in scope. */
  inScopeWhen?: boolean;
};

export type ClassificationOption = {
  value: string;
  label: string;
  description?: string;
};

export type ClassificationGroup = {
  classKey: "critical" | "important_class_ii" | "important_class_i";
  classLabel: string;
  citation: string;
  options: ClassificationOption[];
};

export type ConformityFlow = {
  regulationKey: string;
  regulationName: string;
  scoping: {
    title: string;
    description: string;
    questions: FlowQuestion[];
  };
  classification: {
    title: string;
    description: string;
    /** classKey used when no category below is selected. */
    defaultClassKey: "default";
    defaultClassLabel: string;
    defaultCitation: string;
    groups: ClassificationGroup[];
  };
  route: {
    title: string;
    description: string;
    forkQuestion: FlowQuestion;
  };
};

export const craFlow: ConformityFlow = {
  regulationKey: "cra",
  regulationName: "Cyber Resilience Act",
  scoping: {
    title: "Scoping",
    description:
      "Confirm the Cyber Resilience Act applies to this product before assessing it. Every answer records the Article it depends on.",
    questions: [
      {
        key: "is_pde",
        title:
          "Is this a product with digital elements — a software or hardware product (including its remote data-processing solutions) capable of a direct or indirect logical or physical data connection to a device or network?",
        help: "Almost all connected hardware and software qualifies. Purely mechanical products with no digital element do not.",
        citation: "Art 3(1)",
        inScopeWhen: true,
      },
      {
        key: "made_available_eu",
        title:
          "Will the product be placed on or made available on the EU market in the course of a commercial activity?",
        help: "Includes selling, licensing, or otherwise supplying it to EU users, whether or not for payment, as part of a business activity.",
        citation: "Art 2(1)",
        inScopeWhen: true,
      },
      {
        key: "excluded_sectoral",
        title:
          "Is the product already fully covered by sectoral EU law that carves it out of the CRA — e.g. medical devices (2017/745, 2017/746), motor vehicles (2019/2144), civil aviation (2018/1139), or marine equipment (2014/90)?",
        citation: "Art 2(2)-(4)",
        inScopeWhen: false,
      },
      {
        key: "is_saas_only",
        title:
          "Is it a pure software-as-a-service / cloud service that is NOT a remote data-processing solution integral to a product with digital elements?",
        help: "Standalone SaaS is generally regulated by NIS2, not the CRA. Cloud components required for a product to function are in scope.",
        citation: "Recital 12",
        inScopeWhen: false,
      },
      {
        key: "is_oss_noncommercial",
        title:
          "Is it free and open-source software supplied outside the course of a commercial activity (i.e. not monetised and not supplied as part of a business)?",
        citation: "Art 2(5), Recitals 18-19",
        inScopeWhen: false,
      },
    ],
  },
  classification: {
    title: "Product classification",
    description:
      "Select every category that describes the product. The highest-risk category selected determines the class. If none apply, the product is a default (self-assessed) product.",
    defaultClassKey: "default",
    defaultClassLabel: "Default product",
    defaultCitation: "Art 6 — not listed in Annex III or IV",
    groups: [
      {
        classKey: "critical",
        classLabel: "Critical product (Annex IV)",
        citation: "Annex IV",
        options: [
          {
            value: "hardware_security_module",
            label: "Hardware devices with security boxes / Hardware Security Modules (HSMs)",
          },
          {
            value: "smart_meter_gateway",
            label: "Smart meter gateways within smart metering systems",
          },
          {
            value: "smartcard_secure_element",
            label: "Smartcards, secure elements and similar tamper-resistant devices",
          },
        ],
      },
      {
        classKey: "important_class_ii",
        classLabel: "Important product, Class II (Annex III)",
        citation: "Annex III, Class II",
        options: [
          { value: "operating_systems", label: "Operating systems" },
          {
            value: "hypervisors_containers",
            label: "Hypervisors and container runtime systems supporting virtualised execution",
          },
          {
            value: "pki_issuance",
            label: "Public key infrastructure and digital certificate issuance software",
          },
          {
            value: "firewalls_ids_ips_industrial",
            label: "Firewalls, intrusion detection/prevention systems for industrial use",
          },
          {
            value: "tamper_resistant_microprocessors",
            label: "Tamper-resistant microprocessors and microcontrollers",
          },
        ],
      },
      {
        classKey: "important_class_i",
        classLabel: "Important product, Class I (Annex III)",
        citation: "Annex III, Class I",
        options: [
          {
            value: "identity_access_management",
            label: "Identity management and privileged access management software",
          },
          {
            value: "browsers_password_managers",
            label: "Standalone and embedded browsers; password managers",
          },
          {
            value: "antivirus",
            label: "Malware detection, removal or quarantine software (antivirus)",
          },
          {
            value: "vpn",
            label: "Products with a virtual private network (VPN) function",
          },
          { value: "network_management", label: "Network management systems" },
          {
            value: "siem",
            label: "Security information and event management (SIEM) systems",
          },
          { value: "boot_managers", label: "Boot managers" },
          {
            value: "routers_modems_switches",
            label: "Routers, modems intended for internet connection, and switches",
          },
          {
            value: "microcontrollers_security",
            label: "Microprocessors / microcontrollers with security-related functionalities",
          },
          {
            value: "smart_home_security",
            label:
              "Smart home products with security functions (smart locks, security cameras, alarm and baby-monitoring systems)",
          },
          {
            value: "connected_toys_wearables",
            label:
              "Internet-connected toys and personal wearables for health monitoring or used by children",
          },
        ],
      },
    ],
  },
  route: {
    title: "Conformity assessment route",
    description:
      "The applicable route depends on the class and, for Class I, on whether harmonised standards are fully applied (Article 32).",
    forkQuestion: {
      key: "applies_harmonised_standards",
      title:
        "Will you fully apply harmonised standards, common specifications, or a European cybersecurity certification scheme (at least assurance level 'substantial') covering ALL applicable Annex I essential requirements?",
      help: "Only when standards fully cover the essential requirements can a Class I important product use the self-assessment route (Module A).",
      citation: "Art 32(1)",
    },
  },
};

const FLOWS: Record<string, ConformityFlow> = { cra: craFlow };

export function getFlow(regulationKey: string): ConformityFlow | null {
  return FLOWS[regulationKey] ?? null;
}

export type AnswerMap = Record<
  string,
  { bool?: boolean; text?: string; options?: string[] }
>;

export type ScopeResult = {
  result: "in_scope" | "out_of_scope";
  reasons: string[];
  answered: boolean;
};

/** Pure scoping computation: in scope only when every gate passes. */
export function computeScope(regulationKey: string, answers: AnswerMap): ScopeResult {
  const flow = getFlow(regulationKey);
  if (!flow) return { result: "out_of_scope", reasons: [], answered: false };

  const reasons: string[] = [];
  let answered = true;
  let inScope = true;

  for (const q of flow.scoping.questions) {
    const a = answers[q.key];
    if (!a || typeof a.bool !== "boolean") {
      answered = false;
      continue;
    }
    if (a.bool !== q.inScopeWhen) {
      inScope = false;
      reasons.push(`${q.citation}: "${q.title}" — answered ${a.bool ? "yes" : "no"}.`);
    }
  }

  return {
    result: inScope ? "in_scope" : "out_of_scope",
    reasons,
    answered,
  };
}

export type ClassificationResult = {
  classKey: "critical" | "important_class_ii" | "important_class_i" | "default";
  classLabel: string;
  citation: string;
  matched: { value: string; label: string; classKey: string; citation: string }[];
};

/**
 * Pure classification: the highest-risk selected Annex category wins, else the
 * product is a default (self-assessed) product. Reads the multi-select answer
 * stored under `product_categories`.
 */
export function computeClassification(
  regulationKey: string,
  answers: AnswerMap,
): ClassificationResult {
  const flow = getFlow(regulationKey);
  const selected = new Set(answers["product_categories"]?.options ?? []);
  const matched: ClassificationResult["matched"] = [];

  if (flow) {
    for (const group of flow.classification.groups) {
      for (const opt of group.options) {
        if (selected.has(opt.value)) {
          matched.push({
            value: opt.value,
            label: opt.label,
            classKey: group.classKey,
            citation: group.citation,
          });
        }
      }
    }
  }

  const order: ClassificationResult["classKey"][] = [
    "critical",
    "important_class_ii",
    "important_class_i",
  ];
  const found = order.find((k) => matched.some((m) => m.classKey === k));

  if (!found || !flow) {
    return {
      classKey: "default",
      classLabel: flow?.classification.defaultClassLabel ?? "Default product",
      citation: flow?.classification.defaultCitation ?? "",
      matched,
    };
  }

  const group = flow.classification.groups.find((g) => g.classKey === found)!;
  return {
    classKey: found,
    classLabel: group.classLabel,
    citation: group.citation,
    matched,
  };
}
