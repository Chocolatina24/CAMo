import RiskLikelihood from "./RiskLikelihood"
import RiskType from "./RiskType"
import ExplanatoryRationale from "./Rationale";

export default function ({ element }, translate){

    return {
        id: 'relationship_context_group',
        label: "Relationship context",
        items: [
             {
                id: 'rationale_item',
                label: translate('Explanatory rationale'),
                tooltip: translate('The rationale provides additional insight on why these activities are performed in this order'),
                entries: [
                    ...ExplanatoryRationale(element)
                ]
            },
            {
                id: 'risk_type_item',
                label: translate('Risk type'),
                tooltip: translate('The risk type determines what kind of risk is associated with a change operation on this activity relationship'),
                entries: [
                    ...RiskType(element)
                ]
            },
            {
                id: 'risk_likelihood_item',
                label: translate('Risk likelihood'),
                tooltip: translate('The risk likelihood indicates how likely it is that a change operation leads to a certain risk type occurring'),
                entries: [
                    ...RiskLikelihood(element)
                ]
            }
        ]
    };
}