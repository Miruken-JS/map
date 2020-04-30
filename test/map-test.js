import { Base } from "miruken-core";
import { Context } from "miruken-context";
import { Mapper, MappingHandler } from "../src/mapper";
import { format } from "../src/maps";
import { TypeMapping, TypeFormat, registerType } from "../src/type-mapping";
import { expect } from "chai";

const Request = Base.extend(registerType);

const GetDetails = Request.extend({
    $type: "GetDetails",
    id:    undefined,
});

const CreateDetails = Request.extend({
    $type: " Create Details ",
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

        it("should ignore whitespace in type string", () => {
            const type = mapper.mapTo("CreateDetails", TypeFormat);
            expect(type).to.equal(CreateDetails);
        });

        it("should map type string to Type using helper", () => {
            const type = context.getTypeFromString(" Create Details");
            expect(type).to.equal(CreateDetails);
        });
        
        it("should not map type string to Type if missing", () => {
            const type = mapper.mapTo("UpdateDetails", TypeFormat);
            expect(type).to.be.undefined;
        });

        it("should fail if type string not passed to helper", () => {
            expect(() => {
                context.getTypeFromString({});                
            }).to.throw(Error, /Invalid type string/);  
        });        
    });
});
