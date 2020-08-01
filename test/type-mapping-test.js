import { Base } from "miruken-core";
import { NotHandledError } from "miruken-callback";
import { Context } from "miruken-context";
import { format } from "../src/maps";
import { 
    TypeMapping, TypeIdFormat, typeId, getTypeId
} from "../src/type-mapping";

import "../src/handler-map";

import { expect } from "chai";

class Request extends Base {}

@typeId("GetDetails")
class GetDetails extends Request {
    id = undefined
}

@typeId(" Create Details ")
class CreateDetails extends Request {
    id = undefined
}

class UpdateDetails extends Base {
    id      = undefined
    details = undefined
}

class CreateDetails2 extends CreateDetails {
    data = undefined
}

class Oneway {
    constructor(request) {
        this.request = request;
    }
    @typeId
    get typeId() {
        return `Oneway:${getTypeId(this.request)}`;
    }
}

describe("typeId", () => {
    it("should set class type id", () => {
        expect(getTypeId(GetDetails)).to.equal("GetDetails");
        expect(getTypeId(new GetDetails())).to.equal("GetDetails");
    });

    it("should set class type id on base2 class", () => {
        const Foo = Base.extend(typeId("Foo"));
        expect(getTypeId(Foo)).to.equal("Foo");
        expect(getTypeId(new Foo())).to.equal("Foo");
    });

    it("should normalize type id", () => {
        expect(getTypeId(CreateDetails)).to.equal("CreateDetails");
        expect(getTypeId(new CreateDetails())).to.equal("CreateDetails");
    });

    it("should use class name if missing type id", () => {
        @typeId() class Bar {}
        expect(getTypeId(Bar)).to.equal("Bar");
        expect(getTypeId(new Bar())).to.equal("Bar");
    });

    it("should use class name if empty type id", () => {
        @typeId("") class Bar {}
        expect(getTypeId(Bar)).to.equal("Bar");
        expect(getTypeId(new Bar())).to.equal("Bar");
    });

    it("should set method type id", () => {
        expect(getTypeId(Oneway)).to.be.undefined;
        expect(getTypeId(new Oneway(new GetDetails()))).to.equal("Oneway:GetDetails");
        expect(new Oneway(new GetDetails()).typeId).to.equal("Oneway:GetDetails");
    });

    it("should inherit class type id", () => {
        expect(getTypeId(CreateDetails2)).to.equal("CreateDetails");
        expect(getTypeId(new CreateDetails2())).to.equal("CreateDetails");
    });

    it("should fail if type id is not a string", () => {
        expect(() => {
            @typeId(22) class Bar {}
        }).to.throw(SyntaxError, "@typeId expects a string identifier.");
    });

    it("should fail to infer type id from base2 class", () => {
        expect(() => {
            Base.extend(typeId());
        }).to.throw(Error, "@typeId cannot be inferred from a base2 class.  Please specify it explicitly.");
    });

    it("should fail if @typeId applied to a method", () => {
        expect(() => {
            class Bar {
                @typeId
                foo() {}
            }
        }).to.throw(Error, "@typeId can only be applied to classes or properties.");
    });

    it("should fail if @typeId applied to a setter", () => {
        expect(() => {
            class Bar {
                @typeId
                set foo(value) {}
            }
        }).to.throw(Error, "@typeId can only be applied to classes or properties.");
    });

    it("should fail if dynamic type id is not a string", () => {
        class Bar {
            @typeId
            get typeId() { return 22; } 
        }
        expect(() => {
            getTypeId(new Bar());
        }).to.throw(Error, "@typeId getter 'typeId' returned invalid identifier 22.");
    });
});

describe("TypeMapping", () => {
    let context;
    beforeEach(() => {
        context = new Context();
        context.addHandlers(new TypeMapping());
    });

    describe("#mapTo", () => {
        it("should map type id to Type", () => {
            const type = context.mapTo("GetDetails", TypeIdFormat);
            expect(type).to.equal(GetDetails);
        });

        it("should ignore whitespace in type id", () => {
            const type = context.mapTo("CreateDetails", TypeIdFormat);
            expect(type).to.equal(CreateDetails);
        });

        it("should map type id to Type using helper", () => {
            const type = context.getTypeFromId(" Create Details");
            expect(type).to.equal(CreateDetails);
        });
        
        it("should not map type id to Type if missing", () => {
            expect(() => {
                context.mapTo("UpdateDetails", TypeIdFormat);
            }).to.throw(NotHandledError, "UpdateDetails not handled");
        });

        it("should fail if type id not passed to helper", () => {
            expect(() => {
                context.getTypeFromId({});                
            }).to.throw(Error, /Invalid type id/);  
        });        
    });
});
