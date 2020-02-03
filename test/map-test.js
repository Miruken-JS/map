import { Base } from "miruken-core";
import { Context } from "miruken-context";
import { Mapper, MappingHandler } from "../src/mapper";
import { format } from "../src/decorators";
import { TypeMapping, TypeFormat, registerType } from "../src/type-mapping";
import { expect } from "chai";

const Request = Base.extend(registerType);

const GetDetails = Request.extend({
    $type: "GetDetails",
    id:    undefined,
});

const UpdateDetails = Base.extend({
    $type: "UpdateDetails",
    id:      undefined,
    details: undefined
});

describe("Mapping", () => {
    let context, mapper;
    beforeEach(() => {
        context = new Context();
        context.addHandlers(new MappingHandler(), new TypeMapping());
        mapper = Mapper(context);
    });

    describe("#mapTo", () => {
        it("should map type string to Type", () => {
            const type = mapper.mapTo("GetDetails", TypeFormat);
            expect(type).to.equal(GetDetails);
        });

        it("should not map type string to Type if missing", () => {
            const type = mapper.mapTo("UpdateDetails", TypeFormat);
            expect(type).to.be.undefined;
        });        
    });
});
