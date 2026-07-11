#include <stdio.h>
#include <conio.h>
#include <stdlib.h>
#include <string.h>

struct table
{
    char var[10];
    int value;
};

struct table tbl[20];
int i, j, n = 0;

void create();
void insert();
void modify();
int search(char variable[], int n);
void display();

void main()
{
    int ch, result;
    char v[10];

    clrscr();

    do
    {
        printf("\n------ SYMBOL TABLE ------\n");
        printf("1. Create\n");
        printf("2. Insert\n");
        printf("3. Modify\n");
        printf("4. Search\n");
        printf("5. Display\n");
        printf("6. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &ch);

        switch (ch)
        {
        case 1:
            create();
            break;

        case 2:
            insert();
            break;

        case 3:
            modify();
            break;

        case 4:
            printf("Enter the variable to be searched: ");
            scanf("%s", v);

            result = search(v, n);

            if (result == 0)
                printf("Variable does not exist.\n");
            else
                printf("Variable found at location %d\nValue = %d\n",
                       result, tbl[result].value);
            break;

        case 5:
            display();
            break;

        case 6:
            exit(0);

        default:
            printf("Invalid Choice!\n");
        }

    } while (ch != 6);

    getch();
}

void create()
{
    printf("Enter number of entries: ");
    scanf("%d", &n);

    for (i = 1; i <= n; i++)
    {
        while (1)
        {
            printf("Enter variable and value: ");
            scanf("%s%d", tbl[i].var, &tbl[i].value);

            if (tbl[i].var[0] >= '0' && tbl[i].var[0] <= '9')
            {
                printf("Variable should start with an alphabet.\n");
                continue;
            }

            int duplicate = 0;
            for (j = 1; j < i; j++)
            {
                if (strcmp(tbl[i].var, tbl[j].var) == 0)
                {
                    duplicate = 1;
                    printf("Variable already exists.\n");
                    break;
                }
            }

            if (!duplicate)
                break;
        }
    }

    printf("\nTable after creation:\n");
    display();
}

void insert()
{
    if (n >= 20)
    {
        printf("Table is Full.\n");
        return;
    }

    n++;

    while (1)
    {
        printf("Enter variable and value: ");
        scanf("%s%d", tbl[n].var, &tbl[n].value);

        if (tbl[n].var[0] >= '0' && tbl[n].var[0] <= '9')
        {
            printf("Variable should start with an alphabet.\n");
            continue;
        }

        int duplicate = 0;

        for (j = 1; j < n; j++)
        {
            if (strcmp(tbl[n].var, tbl[j].var) == 0)
            {
                duplicate = 1;
                printf("Variable already exists.\n");
                break;
            }
        }

        if (!duplicate)
            break;
    }

    printf("\nTable after insertion:\n");
    display();
}

void modify()
{
    char variable[10];
    int result;

    printf("Enter variable to modify: ");
    scanf("%s", variable);

    result = search(variable, n);

    if (result == 0)
    {
        printf("Variable not found.\n");
        return;
    }

    while (1)
    {
        printf("Current Value = %d\n", tbl[result].value);
        printf("Enter new variable name and value: ");
        scanf("%s%d", tbl[result].var, &tbl[result].value);

        if (tbl[result].var[0] >= '0' && tbl[result].var[0] <= '9')
        {
            printf("Variable should start with an alphabet.\n");
            continue;
        }

        break;
    }

    printf("\nTable after modification:\n");
    display();
}

int search(char variable[], int n)
{
    for (i = 1; i <= n; i++)
    {
        if (strcmp(tbl[i].var, variable) == 0)
            return i;
    }

    return 0;
}

void display()
{
    int k;

    printf("\n--------------------------\n");
    printf("VARIABLE\tVALUE\n");
    printf("--------------------------\n");

    for (k = 1; k <= n; k++)
        printf("%s\t\t%d\n", tbl[k].var, tbl[k].value);
}