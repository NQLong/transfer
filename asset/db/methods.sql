CREATE OR REPLACE FUNCTION "COMPONENT_CREATE_NEW" (
    class_name   IN   NVARCHAR2,
    style        IN   NVARCHAR2,
    view_type    IN   NVARCHAR2,
    view_id      IN   NUMBER,
    detail      IN NVARCHAR2
) RETURN NUMBER IS
    maxpriority   NUMBER;
    last_id       fw_home_component.id%TYPE;
BEGIN
    BEGIN
        SELECT
            MAX(priority)
        INTO maxpriority
        FROM
            fw_home_component;

    EXCEPTION
        WHEN no_data_found THEN
            maxpriority := 0;
    END;

    IF maxpriority IS NULL THEN
        maxpriority := 0;
    END IF;
    maxpriority := maxpriority + 1;
    INSERT INTO fw_home_component (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        priority
    ) VALUES (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        maxpriority
    ) RETURNING id INTO last_id;

    COMMIT;
    RETURN last_id;
END component_create_new;
/
--EndMethod--

CREATE OR REPLACE FUNCTION CONTACT_SEARCH_PAGE(page_number IN OUT NUMBER, page_size IN OUT NUMBER, read_state In NUMBER, search_term IN STRING, total_item OUT NUMBER, page_total OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(search_term) || '%';
BEGIN
    SELECT COUNT(*)
    INTO total_item
    FROM FW_CONTACT
    WHERE (read_state = -1 OR read_state = READ) and (
        search_term = ''
        OR LOWER(NAME) LIKE sT
        OR LOWER(EMAIL) LIKE sT
        OR LOWER(SUBJECT) LIKE sT
        OR LOWER(MESSAGE) LIKE sT
    );

    IF page_number < 1 THEN page_number := 1; END IF;
    IF page_size < 1 THEN page_size := 1; END IF;
    page_total := CEIL(total_item / page_size);
    page_number := LEAST(page_number, page_total);

    OPEN my_cursor FOR
        SELECT *
        FROM (
            SELECT NAME                         AS  "name",
                   EMAIL                        AS  "email",
                   SUBJECT                      AS  "subject",
--                    MESSAGE                      AS  "message",
                   READ                         AS  "read",
                   CREATED_DATE                 AS  "createdDate",
                   ID                           AS  "id",
                   ROW_NUMBER() OVER (ORDER BY ID DESC) R
            FROM FW_CONTACT
            WHERE (read_state = -1 OR read_state = READ) and (
                search_term = ''
                OR LOWER(NAME) LIKE sT
                OR LOWER(EMAIL) LIKE sT
                OR LOWER(SUBJECT) LIKE sT
                OR LOWER(MESSAGE) LIKE sT
            )
        ) WHERE R BETWEEN (page_number - 1) * page_size + 1 AND  page_number * page_size;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_LINH_VUC_KINH_DOANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_LINH_VUC_KINH_DOANH LV
    WHERE searchTerm = ''
       OR LOWER(TRIM(TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT LV.MA                        AS  "ma",
                    LV.TEN                          AS  "ten",
                    LV.MO_TA                        AS  "moTa",
                    LV.KICH_HOAT                    AS  "kichHoat",
                    ROW_NUMBER() OVER (ORDER BY MA DESC) R
                FROM DM_LINH_VUC_KINH_DOANH LV
                WHERE searchTerm = ''
                    OR LOWER(TRIM(TEN)) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_create_new_item (p_maDonVi in nvarchar2, p_ten in nvarchar2, p_noiDung in clob, p_trongSo in number,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU (ma_don_vi, ten, thu_tu, noi_dung, trong_so, kich_hoat) values (p_maDonVi, p_ten, maxThuTu, p_noiDung, p_trongSo, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_hinh_create_new_item (p_link in nvarchar2, p_maWebsiteGioiThieu in nvarchar2, p_image in nvarchar2, p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU_HINH where MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU_HINH (thu_tu, link, ma_website_gioi_thieu, image, kich_hoat) values (maxThuTu, p_link, p_maWebsiteGioiThieu, p_image, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maWebsiteGioiThieu in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU_HINH where MA=p_id and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU>thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU<thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_hinh_create_new_item (p_maDonVi in nvarchar2, p_image in nvarchar2, p_tieuDe in nvarchar2, p_link in nvarchar2,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_HINH where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_HINH (ma_don_vi, image, tieu_de, link, thu_tu, kich_hoat) values (p_maDonVi, p_image, p_tieuDe, p_link, maxThuTu, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_HINH where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DV_WEBSITE_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DV_WEBSITE ws
             LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA
    WHERE searchTerm = ''
        OR LOWER(ws.SHORTNAME) LIKE sT
        OR LOWER(dv.TEN) LIKE sT;

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT  ws.SHORTNAME                         AS  "shortname",
                        ws.KICH_HOAT                         AS  "kichHoat",
                        ws.WEBSITE                           AS  "website",
                        ws.MA_DON_VI                         AS  "maDonVi",
                        dv.TEN                               AS  "tenDonVi",
                        ROW_NUMBER() OVER (ORDER BY ws.SHORTNAME DESC) R
                FROM DV_WEBSITE ws

                    LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA

                WHERE searchTerm = ''
                OR LOWER(ws.SHORTNAME) LIKE sT
                OR LOWER(dv.TEN) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION "FW_USER_GET_USER_ROLES" (pemail in nvarchar2)
RETURN SYS_REFCURSOR
AS
my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT fw_role.id as "id", fw_role.name as "name", fw_role.permission as "permission"
        FROM fw_user_role, fw_role
        WHERE fw_user_role.email=pemail AND fw_user_role.role_id=fw_role.id AND fw_role.active=1;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE PROCEDURE home_footer_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_HOME_FOOTER SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION menu_create_default (parent_id in number, title in nvarchar2, link in nvarchar2, active in number,maDonVi in nvarchar2,maWebsite in nvarchar2) RETURN NUMBER
IS
    maxPriority number;
    last_id FW_HOME_MENU.id%TYPE;
BEGIN
    begin
        select MAX(PRIORITY) into maxPriority from FW_HOME_MENU;
    exception
        when NO_DATA_FOUND then
        maxPriority := 0;
    end;
    if maxPriority is null then
        maxPriority := 0;
    end if;
    maxPriority := maxPriority+1;

    if parent_id is null then
        insert into FW_HOME_MENU (title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (title, link, active, maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    else
        insert into FW_HOME_MENU (parent_id, title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (parent_id, title, link, active,maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    end if;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE PROCEDURE sub_menu_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_SUBMENU SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;
/
--EndMethod--

