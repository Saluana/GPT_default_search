export interface SearchResponse {
    data: SearchResult[] | null;
    error: string | null;
}

export interface SearchResult {
    url: string;
    description: string;
    name: string;
}

export async function searchBing(
    query: string,
    count: number = 5,
    apiKey: string
): Promise<SearchResponse> {
    let result: SearchResponse = {
        data: null,
        error: null,
    };

    //make the request in axios
    const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${query}&count=${count}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        }
    );

    //parse the response
    const json = await response.json();
    console.log('SR', json);
    //validate response
    if (!json.webPages || !json.webPages.value) {
        console.log('Invalid response from Bing');
        return {
            data: null,
            error: 'Invalid response from Bing',
        } as SearchResponse;
    }

    //return the top 5 results
    result.data = json.webPages.value.map((result: any) => ({
        url: result.url,
        description: result.snippet,
        name: result.name,
    })) as SearchResult[];

    return result;
}
