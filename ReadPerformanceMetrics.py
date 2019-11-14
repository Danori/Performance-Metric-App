import asyncio
from itertools import cycle
from lib.cortex import Cortex


async def recordBrainData(cortex):
    print("Logging in User ... ", end = '')
    await cortex.get_user_login()
    print("Done.")

    print("Getting cortex info ... ", end = '')
    await cortex.get_cortex_info()
    print("Done.")

    print("Checking if client has access rights ... ", end = '')
    await cortex.has_access_right()
    print("Done.")

    print("Requesting access ... ", end = ''),
    await cortex.request_access()
    print("Done.")

    print("Authorizing ... ", end = '')
    await cortex.authorize()
    print("Done.")

    print("Getting license info ... ", end = '')
    await cortex.get_license_info()
    print("Done.")

    print("Querying headsets ... ", end = '')
    await cortex.query_headsets()
    print("Done.")

    if len(cortex.headsets) > 0:
        print("Creating session ... ", end = '')
        await cortex.create_session(activate=True,
                                    headset_id=cortex.headsets[0])
        print ("Done.")

        print("Creating record ... ", end = '')
        await cortex.create_record(title="test record 1")
        print("Done.")

        print("Subscribing to pow stream ... ", end = '')
        await cortex.subscribe(['pow'])
        print("Done.")

        print("\n---------------------\n"
                "Press ctrl+c to exit."
              "\n---------------------\n")
        loop = cycle(r"-\|/")

        try:
            while True:
                data = await cortex.get_data()
                print("Reading brain data, see web application!", next(loop), end='\r', flush=True)

                
        except KeyboardInterrupt:
            await cortex.close_session()


def test():
    cortex = Cortex('./CortexCredentials')
    asyncio.run(recordBrainData(cortex))
    cortex.close()


if __name__ == '__main__':
    test()
