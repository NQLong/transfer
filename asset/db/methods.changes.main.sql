CREATE OR REPLACE FUNCTION HCTH_DASHBOARD_GET_DATA(
    time IN NUMBER,
    HCTH_CONG_VAN_DEN OUT SYS_REFCURSOR,
    HCTH_CONG_VAN_DI OUT SYS_REFCURSOR,
    VAN_BAN_DEN_NAM OUT SYS_REFCURSOR,
    VAN_BAN_DI_NAM OUT SYS_REFCURSOR
) RETURN SYS_REFCURSOR
AS
    DATA_VB SYS_REFCURSOR;
    today   NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN HCTH_CONG_VAN_DEN FOR
        SELECT COUNT(*) AS "tongVanBanDen"

        FROM HCTH_CONG_VAN_DEN cvden
        WHERE cvden.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvden.NGAY_NHAN >= time));

    OPEN HCTH_CONG_VAN_DI FOR
        SELECT COUNT(*) AS "tongVanBanDi"
        FROM HCTH_CONG_VAN_DI cvdi
        WHERE cvdi.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvdi.NGAY_TAO >= time));

    OPEN VAN_BAN_DEN_NAM FOR
        SELECT *
        FROM HCTH_CONG_VAN_DEN cvden
        WHERE cvden.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvden.NGAY_NHAN >= time));

    OPEN VAN_BAN_DI_NAM FOR
        SELECT *
        FROM HCTH_CONG_VAN_DI cvdi
        WHERE cvdi.TRICH_YEU IS NOT NULL
          AND (time IS NULL OR (cvdi.NGAY_TAO >= time));

    OPEN DATA_VB FOR
        select "numOfDocument",
               "maDonVi",
               "numOfDen",
               "numOfDi",
               dv.TEN          as "tenDonVi",
               dv.TEN_VIET_TAT as "tenVietTat"
        from (
                 SELECT COUNT(dvn.ID)   as "numOfDocument",
                        dvn.DON_VI_NHAN as "maDonVi",
                        COUNT(case when dvn.LOAI = 'DI' then 1 END) as "numOfDi",
                        COUNT(case when dvn.LOAI = 'DEN' then 1 end) as "numOfDen"
                 FROM HCTH_DON_VI_NHAN dvn
                          left join HCTH_CONG_VAN_DEN cvden on (dvn.MA = cvden.ID AND dvn.LOAI = 'DEN')
                          LEFT JOIN HCTH_CONG_VAN_DI cvdi on (dvn.MA = cvdi.ID AND dvn.LOAI = 'DI')
                 WHERE dvn.DON_VI_NHAN_NGOAI = 0
                   AND (
                         ((cvden.NGAY_NHAN >= time) AND (dvn.LOAI = 'DEN'))
                         OR ((cvdi.NGAY_TAO >= time) AND (dvn.LOAI = 'DI'))
                       OR (time IS NULL AND(dvn.LOAI = 'DEN' OR dvn.LOAI = 'DI'))
                     )
                 group by dvn.DON_VI_NHAN
                 ORDER BY dvn.DON_VI_NHAN asc
             )
                 LEFT JOIN DM_DON_VI dv on "maDonVi" = dv.MA;

    RETURN DATA_VB;
END;

/
--EndMethod--

