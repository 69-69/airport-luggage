
const DemoWithID = async ({params}: { params: Promise<{ id: string }> }) => {
    const {id} = await params;
    console.log(id);


    return (
        <div>
            <h1>Demo Number: #{id}</h1>
        </div>
    );
}
export default DemoWithID;
