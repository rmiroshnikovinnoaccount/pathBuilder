type PathType = {
    path: string
    name: string
    children?: PathType[]
    render?: (prevPath: string) => string
}

const paths: PathType[] = [
    {
        path: "security-server",
        name: "security",
        children: [
            {
                path: "auth",
                name: "auth",
                children: [
                    {
                        path: "bot",
                        name: "authAsBot",
                        render: (prevPath) => {
                            return `${ prevPath }botASDZXCASDASD`;
                        }
                    },
                    {
                        path: "user",
                        name: "authAsUser"
                    }
                ]
            },
            {
                path: "jwt",
                name: "jwt"
            }
        ]
    },
    {
        path: "migration-server",
        name: "migration"
    }
];

const findDuplicates = (strArr: string[]): string[] => {
    return strArr.filter((item, index) => strArr.indexOf(item) != index);
};

const getAllFunctionNames = (arr: PathType[]): string[] => {
    const strArr: string[] = [];

    arr.forEach(v => {
        reversePushToArray(v, strArr);
    });

    return strArr;
};

const reversePushToArray = (node: PathType, arr: string[]) => {
    arr.push(node.name);
    if (node.children) {
        node.children.forEach(ch => {
            reversePushToArray(ch, arr);
        });
    }
};

class PathNode {
    path: string;
    name: string;
    childrenNodes: PathNode[];
    parentNode: PathNode | null;
    render?: (prevPath: string) => string;

    constructor(name: string, path: string, render?: (prevPath: string) => string) {
        this.path = path;
        this.name = name;
        this.childrenNodes = new Array<PathNode>();
        this.parentNode = null;
        this.render = render;
    }

    setParent(node: PathNode | null) {
        this.parentNode = node;
    }

    addChild(node: PathNode) {
        this.childrenNodes.push(node);
    }

}

class PathTree {
    allNodes: PathNode[] = [];

    addNode(nodeName: string, path: string, render?: (prevPath: string) => string): PathNode {
        let node = this.getTableNodeByName(nodeName);
        if (!node) {
            node = new PathNode(nodeName, path, render);
            this.allNodes.push(node);
        }
        return node;
    }

    getParents(): PathNode[] {
        return this.allNodes.filter(node => node.parentNode === null);
    }

    private getTableNodeByName = (nodeName: string): PathNode | undefined => {
        return this.allNodes.find(value => value.name === nodeName);
    };

}

const isCompareStringArray = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
};

const createPath = (initValues: PathType[], pathFunctions: object) => {
    const allFunctionNames = getAllFunctionNames(initValues)
    .sort();
    const duplicates = findDuplicates(allFunctionNames);
    if (duplicates.length > 0) {
        throw new Error(`Имена функций должны быть уникальны. Совпадения: ${ duplicates }`);
    }
    const allPathFunctions = Object.keys(pathFunctions)
                                   .sort();
    if (!isCompareStringArray(allPathFunctions, allFunctionNames)) {
        throw new Error(`pathFunctions не совпадает с именами функций в path: \n\n${ allFunctionNames } \n!== \n${ allPathFunctions }`);
    }

    const tree = new PathTree();

    initValues.forEach(value => {
        reverseCreateNode(value, tree, null);
    });

    const parents = tree.getParents();
    let result: any = {};

    parents.forEach(v => {
        reverseCreateFunctions(v, result);
    });

    return result!;
};

const reverseCreateNode = (value: PathType, tree: PathTree, parent: PathNode | null) => {
    const node = tree.addNode(value.name, value.path, value.render);
    node.setParent(parent);
    value.children?.forEach(ch => {
        const newNode = tree.addNode(ch.name, ch.path, ch.render);
        node.addChild(newNode);
        reverseCreateNode(ch, tree, node);
    });
};

const reverseCreateFunctions = (node: PathNode, result: any) => {
    result[node.name] = (url?: string): string => {
        const result = { a: "" };
        const customPath: string | undefined = reverseCreatePath(node, result);
        if (customPath) {
            return url ? customPath + url : customPath;
        }
        return url ? result.a + url : result.a;
    };
    node.childrenNodes.forEach(ch => {
        reverseCreateFunctions(ch, result);
    });
};

const reverseCreatePath = (node: PathNode, result: { a: string }): string | undefined => {
    if (node.parentNode) {
        reverseCreatePath(node.parentNode, result);
    }
    if (node.render) {
        return node.render(result.a);
    } else {
        result.a += node.path + "/";
    }
};

const pathFunctions = {
    authAsBot: null,
    authAsUser: null,
    migration: null,
    jwt: null,
    auth: null,
    security: null
};

const createdPath = createPath(paths, pathFunctions);

console.log(
    createdPath
);