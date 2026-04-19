import { AvailableNodesList, hasCycle } from "@nextflow/core";

import { Node} from "reactflow";
import { EDGE_COLORS } from "@/ui/tones/tones";
import { HANDLER_TYPE_TO_TONE } from "../type";

export const GenerateDefaultNodeData = (feType: string) => {
    const coreType = feType;
    const def = AvailableNodesList.find((n) => n.type === coreType);
    const data: Record<string, any> = { label: feType.replace("_", " ") };
    
    if (def && def.controls) {
      for (const ctrl of def.controls) {
        if ('defaultValue' in ctrl) {
          data[ctrl.id] = ctrl.defaultValue;
          data.status = "PENDING";
        }
      }
    }
    return data;
  };

  export const MapEdgeColors = (sourceNode: Node | undefined, handleId: string | null) => {
    let stroke = EDGE_COLORS["yellow"].stroke;
    
    if (sourceNode) {
      const sourceDef = AvailableNodesList.find((n) => n.type === sourceNode.type);
      
      if (sourceDef && handleId) {
        // FIX: Search 'outputs' instead of 'inputs'
        const outputPort = sourceDef.outputs.find((o) => o.id === handleId); 
        
        if (outputPort) {
          const matchedTone = HANDLER_TYPE_TO_TONE[outputPort.type];
          if (matchedTone) {
            stroke = EDGE_COLORS[matchedTone].stroke;
          }
        }
      }
    }
    return stroke;
  };