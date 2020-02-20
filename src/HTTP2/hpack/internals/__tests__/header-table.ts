import HeaderTable from '../header-table';
import createStaticList from '../static-header-list';

const staticList = createStaticList();

describe("HeaderTable", function() {
    it("should be able to look up or resolve static value.", function() {
        const table = new HeaderTable(1024 * 16);

        debugger;
        for (let i = 0; i < staticList.length; ++i) {

            const [
                name, value
            ] = staticList[i];

            let expName, expValue;
            if (value === null) {
                expName = table.getName(i + 1);
                expValue = null;
            }
            else {
                const nV = table.getNameAndValue(i + 1);
                expName = nV.name;
                expValue = nV.value;
            }

            expect(expName).toEqual(name);
            expect(expValue).toEqual(value);
        }
    });

    it("should throw an error when name or name-pair are not found.", function() {
        const table = new HeaderTable(1024 * 16);

        //[":authority",null],
        //[":method","GET"],
        let errCount = 0;
        try {
            // authorize only
            table.getNameAndValue(1);
        } catch(e) {
            errCount++
        }

        try {
            // method : get
            table.getName(2);
        } catch(e) {
            errCount++
        }

        expect(errCount).toEqual(2);
    });

    it("should insert into the dynamic table.", function() {
        const table = new HeaderTable(1024 * 16);

        const fooId = table.insert("foo", null);
        const barId = table.insert("foo", "bar");

        expect(table.getName(fooId)).toEqual("foo");
        expect(table.getNameAndValue(barId)).toEqual({name: "foo", value: "bar"});
    });

    it("should dynamic size the header table.", function() {
        const table = new HeaderTable(200);
    });
});


