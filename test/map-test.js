import { Base, design } from "miruken-core";
import { Handler } from "miruken-callback";
import { Context } from "miruken-context";
import { Mapper, MappingHandler } from "../src/mapper";
import { mapTo, format } from "../src/decorators";
import { expect } from "chai";

export const DesignFormat = Symbol();

const GetDetails = Base.extend({
    $type: "GetDetails",
    id:    undefined,
});

const UpdateDetails = Base.extend({
    $type: "UpdateDetails",
    id:      undefined,
    details: undefined
});

const DesignMapping = Handler.extend(format(DesignFormat), {
    @mapTo(GetDetails.prototype.$type)
    mapGetDetails() { return GetDetails; }
});

describe("Mapping", () => {
    let context, mapper;
    beforeEach(() => {
        context = new Context();
        context.addHandlers(new MappingHandler(), new DesignMapping());
        mapper = Mapper(context);
    });

    const TypeMapping = 
    describe("#mapTo", () => {
        it("should map type string to Type", () => {
            const type = mapper.mapTo("GetDetails", DesignFormat);
            expect(type).to.equal(GetDetails);            
        });

        it("should not map type string to Type if missing", () => {
            const type = mapper.mapTo("UpdateDetails", DesignFormat);
            expect(type).to.be.undefined;
        });        
    });
});
